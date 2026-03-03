from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Lead Models
class LeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    stage: Optional[str] = None
    service_interest: Optional[str] = None
    source_page: Optional[str] = None
    message: Optional[str] = None

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    stage: Optional[str] = None
    service_interest: Optional[str] = None
    source_page: Optional[str] = None
    message: Optional[str] = None
    status: str = Field(default="New")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quiz_answers: Optional[Dict[str, str]] = None
    ai_assessment: Optional[Dict[str, Any]] = None

# Stage Assessment Models
class QuizAnswers(BaseModel):
    current_situation: Optional[str] = None
    hardest_right_now: Optional[str] = None
    business_direction: Optional[str] = None
    dependency: Optional[str] = None
    scale_readiness: Optional[str] = None
    decision_bottleneck: Optional[str] = None
    intent: Optional[str] = None

class StageAssessmentRequest(BaseModel):
    answers: Dict[str, str]
    user_details: Dict[str, str]

class StageAssessmentResponse(BaseModel):
    stage: str
    bottleneck: str
    stage_description: str
    bottleneck_description: str
    what_to_avoid: str
    recommended_system: Dict[str, str]
    personalized_insight: str
    lead_id: str

# Admin Auth
class AdminLogin(BaseModel):
    password: str

class LeadStatusUpdate(BaseModel):
    status: str

# Scroll Analytics Models
class ScrollEvent(BaseModel):
    page: str
    section: str
    section_index: int
    total_sections: int
    session_id: str
    viewport_height: Optional[int] = None

class ScrollEventStored(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    section: str
    section_index: int
    total_sections: int
    session_id: str
    viewport_height: Optional[int] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Financial Models
class PaymentCreate(BaseModel):
    client_id: Optional[str] = None
    client_name: str
    client_email: Optional[str] = None
    amount: float
    currency: str = "INR"
    source: str  # Razorpay, Bank, Cash
    type: str  # Monthly, One-Time
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: Optional[str] = None
    client_name: str
    client_email: Optional[str] = None
    amount: float
    currency: str = "INR"
    source: str
    type: str
    date: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    total_paid: float = 0.0
    active_project: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RevenueStats(BaseModel):
    total_revenue: float
    current_month_revenue: float
    mrr: float
    arr: float

# BoltGuider Onboarding Models
class BoltGuiderOnboardingCreate(BaseModel):
    full_name: str
    startup_name: str
    website_or_deck: Optional[str] = None
    current_stage: str
    monthly_revenue: str
    growth_bottleneck: str
    attempted_solutions: str
    core_offer: str
    ideal_customer: str
    running_paid_ads: str
    team_structure: str

class BoltGuiderOnboarding(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    startup_name: str
    website_or_deck: Optional[str] = None
    current_stage: str
    monthly_revenue: str
    growth_bottleneck: str
    attempted_solutions: str
    core_offer: str
    ideal_customer: str
    running_paid_ads: str
    team_structure: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Marketing Activity Models
class MarketingLogCreate(BaseModel):
    month: int
    year: int
    linkedin_outreach: int = 0
    whatsapp_conversations: int = 0
    newsletters_sent: int = 0
    proposals_sent: int = 0

class MarketingLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: int
    year: int
    linkedin_outreach: int = 0
    whatsapp_conversations: int = 0
    newsletters_sent: int = 0
    proposals_sent: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConversionMetrics(BaseModel):
    lead_to_proposal_percent: float
    close_rate_percent: float
    clarity_to_close_percent: float

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "FounderPlane API"}

# Status endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ============ LEAD ENDPOINTS ============

@api_router.post("/leads", response_model=Lead, status_code=201)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead from form submission"""
    lead = Lead(**lead_data.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"New lead created: {lead.email} from {lead.source_page}")
    return lead

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(
    service: Optional[str] = None,
    stage: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    admin_password: Optional[str] = Header(None, alias="X-Admin-Password")
):
    """Get all leads (admin only)"""
    expected_password = os.environ.get('ADMIN_PASSWORD', 'founderplane2024')
    if admin_password != expected_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    query = {}
    if service:
        query['service_interest'] = service
    if stage:
        query['stage'] = stage
    if status:
        query['status'] = status
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.patch("/leads/{lead_id}/status")
async def update_lead_status(
    lead_id: str,
    status_update: LeadStatusUpdate,
    admin_password: Optional[str] = Header(None, alias="X-Admin-Password")
):
    """Update lead status (admin only)"""
    expected_password = os.environ.get('ADMIN_PASSWORD', 'founderplane2024')
    if admin_password != expected_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    valid_statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"success": True, "status": status_update.status}

@api_router.get("/leads/stats")
async def get_lead_stats(admin_password: Optional[str] = Header(None, alias="X-Admin-Password")):
    """Get lead statistics (admin only)"""
    expected_password = os.environ.get('ADMIN_PASSWORD', 'founderplane2024')
    if admin_password != expected_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    total = await db.leads.count_documents({})
    
    # Get counts by service
    pipeline = [
        {"$group": {"_id": "$service_interest", "count": {"$sum": 1}}}
    ]
    by_service = await db.leads.aggregate(pipeline).to_list(100)
    
    # Get counts by stage
    pipeline_stage = [
        {"$group": {"_id": "$stage", "count": {"$sum": 1}}}
    ]
    by_stage = await db.leads.aggregate(pipeline_stage).to_list(100)
    
    # Get counts by status
    pipeline_status = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    by_status = await db.leads.aggregate(pipeline_status).to_list(100)
    
    # Get recent (last 7 days)
    from datetime import timedelta
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent = await db.leads.count_documents({"created_at": {"$gte": week_ago}})
    
    return {
        "total": total,
        "recent_7_days": recent,
        "by_service": {item["_id"] or "Unknown": item["count"] for item in by_service},
        "by_stage": {item["_id"] or "Unknown": item["count"] for item in by_stage},
        "by_status": {item["_id"] or "New": item["count"] for item in by_status}
    }

# ============ ADMIN AUTH ============

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    """Verify admin password"""
    expected_password = os.environ.get('ADMIN_PASSWORD', 'founderplane2024')
    if login.password == expected_password:
        return {"success": True, "message": "Authenticated"}
    raise HTTPException(status_code=401, detail="Invalid password")

# ============ AI STAGE ASSESSMENT ============

@api_router.post("/stage-assessment", response_model=StageAssessmentResponse)
async def create_stage_assessment(request: StageAssessmentRequest):
    """Generate AI-powered stage assessment and save as lead"""
    
    answers = request.answers
    user_details = request.user_details
    
    # Build context from quiz answers
    quiz_context = f"""
    User Quiz Responses:
    1. Current Situation: {answers.get('current_situation', 'Not answered')}
    2. Hardest Right Now: {answers.get('hardest_right_now', 'Not answered')}
    3. Business Direction: {answers.get('business_direction', 'Not answered')}
    4. Founder Dependency: {answers.get('dependency', 'Not answered')}
    5. Scale Readiness: {answers.get('scale_readiness', 'Not answered')}
    6. Decision Bottleneck: {answers.get('decision_bottleneck', 'Not answered')}
    7. 6-Month Intent: {answers.get('intent', 'Not answered')}
    
    User Name: {user_details.get('name', 'Founder')}
    """
    
    system_prompt = """You are a startup strategy advisor for FounderPlane, a consultancy helping founders at different stages. 
    
    Based on the quiz answers, provide a JSON response with:
    1. stage: One of "Launch", "Growth", or "Scale"
    2. bottleneck: One of "Clarity", "Positioning", "Revenue", "Systems", or "Founder Dependency"
    3. stage_description: 2-3 sentences explaining their stage
    4. bottleneck_description: 2-3 sentences about their primary constraint
    5. what_to_avoid: What they should NOT focus on right now
    6. recommended_system: Object with "name", "description", and "route" for the recommended FounderPlane service
       - BoltGuider (/services/boltguider) for Launch+Clarity
       - BrandToFly (/services/brandtofly) for Launch+Positioning  
       - D2CBolt (/services/d2cbolt) for Growth+Revenue
       - BoltRunway (/services/boltrunway) for Growth+Systems
       - ScaleRunway (/services/scalerunway) for Scale+Founder Dependency
    7. personalized_insight: A personalized 3-4 sentence insight addressing them by name, specific to their situation
    
    Return ONLY valid JSON, no markdown."""
    
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"stage-assessment-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=quiz_context)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Clean response if needed
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        assessment = json.loads(response_text)
        
        # Create lead from assessment
        lead = Lead(
            name=user_details.get('name', ''),
            email=user_details.get('email', ''),
            phone=user_details.get('phone', ''),
            stage=assessment.get('stage', ''),
            service_interest=assessment.get('recommended_system', {}).get('name', ''),
            source_page='Stage Clarity Check',
            message=f"Quiz completed. Stage: {assessment.get('stage')}. Bottleneck: {assessment.get('bottleneck')}."
        )
        
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['quiz_answers'] = answers
        doc['ai_assessment'] = assessment
        await db.leads.insert_one(doc)
        
        logger.info(f"AI Assessment completed for {user_details.get('email')}: Stage={assessment.get('stage')}")
        
        return StageAssessmentResponse(
            stage=assessment.get('stage', 'Launch'),
            bottleneck=assessment.get('bottleneck', 'Clarity'),
            stage_description=assessment.get('stage_description', ''),
            bottleneck_description=assessment.get('bottleneck_description', ''),
            what_to_avoid=assessment.get('what_to_avoid', ''),
            recommended_system=assessment.get('recommended_system', {
                "name": "BoltGuider",
                "description": "A guided clarity system",
                "route": "/services/boltguider"
            }),
            personalized_insight=assessment.get('personalized_insight', ''),
            lead_id=lead.id
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI assessment")
    except Exception as e:
        logger.error(f"AI assessment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ SCROLL ANALYTICS ============

@api_router.post("/analytics/scroll-events", status_code=201)
async def track_scroll_event(event: ScrollEvent):
    """Track a scroll event when user reaches a page section"""
    stored = ScrollEventStored(**event.model_dump())
    doc = stored.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.scroll_events.insert_one(doc)
    return {"success": True}

@api_router.post("/analytics/scroll-events/batch", status_code=201)
async def track_scroll_events_batch(events: List[ScrollEvent]):
    """Track multiple scroll events in one request"""
    docs = []
    for event in events:
        stored = ScrollEventStored(**event.model_dump())
        doc = stored.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        docs.append(doc)
    if docs:
        await db.scroll_events.insert_many(docs)
    return {"success": True, "count": len(docs)}

@api_router.get("/analytics/scroll-stats")
async def get_scroll_stats(
    admin_password: Optional[str] = Header(None, alias="X-Admin-Password"),
    days: int = 30
):
    """Get scroll analytics stats (admin only)"""
    expected_password = os.environ.get('ADMIN_PASSWORD', 'founderplane2024')
    if admin_password != expected_password:
        raise HTTPException(status_code=401, detail="Unauthorized")

    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # Total unique sessions
    pipeline_sessions = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {"_id": "$session_id"}},
        {"$count": "total"}
    ]
    session_result = await db.scroll_events.aggregate(pipeline_sessions).to_list(1)
    total_sessions = session_result[0]["total"] if session_result else 0

    # Per-page section reach (how many unique sessions reached each section)
    pipeline_pages = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {
            "_id": {"page": "$page", "section": "$section", "section_index": "$section_index", "total_sections": "$total_sections"},
            "unique_sessions": {"$addToSet": "$session_id"},
        }},
        {"$project": {
            "page": "$_id.page",
            "section": "$_id.section",
            "section_index": "$_id.section_index",
            "total_sections": "$_id.total_sections",
            "reach_count": {"$size": "$unique_sessions"},
            "_id": 0
        }},
        {"$sort": {"page": 1, "section_index": 1}}
    ]
    section_stats = await db.scroll_events.aggregate(pipeline_pages).to_list(500)

    # Unique sessions per page
    pipeline_page_sessions = [
        {"$match": {"timestamp": {"$gte": cutoff}}},
        {"$group": {
            "_id": "$page",
            "unique_sessions": {"$addToSet": "$session_id"}
        }},
        {"$project": {
            "page": "$_id",
            "total_visitors": {"$size": "$unique_sessions"},
            "_id": 0
        }},
        {"$sort": {"total_visitors": -1}}
    ]
    page_sessions = await db.scroll_events.aggregate(pipeline_page_sessions).to_list(100)

    # Recent events count
    total_events = await db.scroll_events.count_documents({"timestamp": {"$gte": cutoff}})

    return {
        "total_sessions": total_sessions,
        "total_events": total_events,
        "days": days,
        "page_visitors": page_sessions,
        "section_stats": section_stats
    }

# ============ FINANCIAL ENDPOINTS ============

@api_router.post("/payments", response_model=Payment, status_code=201)
async def create_payment(payment_data: PaymentCreate):
    """Create a new payment entry"""
    payment = Payment(**payment_data.model_dump())
    doc = payment.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.payments.insert_one(doc)
    
    # Update or create client record
    if payment_data.client_id:
        client = await db.clients.find_one({"id": payment_data.client_id}, {"_id": 0})
        if client:
            new_total = client.get('total_paid', 0) + payment_data.amount
            await db.clients.update_one(
                {"id": payment_data.client_id},
                {"$set": {"total_paid": new_total}}
            )
    
    logger.info(f"Payment created: {payment.client_name} - {payment.amount} {payment.currency}")
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(limit: int = 100):
    """Get all payments"""
    payments = await db.payments.find({}, {"_id": 0}).sort("date", -1).to_list(limit)
    for payment in payments:
        if isinstance(payment.get('date'), str):
            payment['date'] = datetime.fromisoformat(payment['date'])
        if isinstance(payment.get('created_at'), str):
            payment['created_at'] = datetime.fromisoformat(payment['created_at'])
    return payments

@api_router.get("/payments/stats", response_model=RevenueStats)
async def get_revenue_stats():
    """Get revenue statistics"""
    from datetime import date
    import calendar
    
    # Total revenue
    pipeline_total = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    result_total = await db.payments.aggregate(pipeline_total).to_list(1)
    total_revenue = result_total[0]['total'] if result_total else 0.0
    
    # Current month revenue
    now = datetime.now(timezone.utc)
    first_day = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    last_day = datetime(now.year, now.month, calendar.monthrange(now.year, now.month)[1], 23, 59, 59, tzinfo=timezone.utc)
    
    pipeline_month = [
        {"$match": {"date": {"$gte": first_day.isoformat(), "$lte": last_day.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result_month = await db.payments.aggregate(pipeline_month).to_list(1)
    current_month_revenue = result_month[0]['total'] if result_month else 0.0
    
    # MRR (Monthly Recurring Revenue)
    pipeline_mrr = [
        {"$match": {"type": "Monthly"}},
        {"$group": {"_id": "$client_id", "amount": {"$first": "$amount"}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result_mrr = await db.payments.aggregate(pipeline_mrr).to_list(1)
    mrr = result_mrr[0]['total'] if result_mrr else 0.0
    
    # ARR = MRR * 12
    arr = mrr * 12
    
    return RevenueStats(
        total_revenue=total_revenue,
        current_month_revenue=current_month_revenue,
        mrr=mrr,
        arr=arr
    )

@api_router.get("/clients", response_model=List[Client])
async def get_clients():
    """Get all clients with LTV"""
    clients = await db.clients.find({}, {"_id": 0}).sort("total_paid", -1).to_list(100)
    for client in clients:
        if isinstance(client.get('created_at'), str):
            client['created_at'] = datetime.fromisoformat(client['created_at'])
    return clients

@api_router.post("/clients", response_model=Client, status_code=201)
async def create_client(client_data: Dict[str, Any]):
    """Create a new client"""
    client = Client(**client_data)
    doc = client.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clients.insert_one(doc)
    return client

@api_router.patch("/clients/{client_id}")
async def update_client(client_id: str, update_data: Dict[str, Any]):
    """Update client information"""
    await db.clients.update_one(
        {"id": client_id},
        {"$set": update_data}
    )
    return {"message": "Client updated successfully"}

# ============ RAZORPAY WEBHOOK ============

@api_router.post("/webhooks/razorpay")
async def razorpay_webhook(request: dict):
    """Handle Razorpay webhook events"""
    import hmac
    import hashlib
    
    # Verify webhook signature (in production, get from headers)
    webhook_secret = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
    
    # For now, process the event (signature verification would happen in production)
    event_type = request.get('event')
    
    if event_type == 'payment.captured':
        payment_entity = request.get('payload', {}).get('payment', {}).get('entity', {})
        
        # Extract payment details
        amount = payment_entity.get('amount', 0) / 100  # Razorpay amount is in paise
        email = payment_entity.get('email', '')
        notes = payment_entity.get('notes', {})
        
        # Try to match with existing client by email
        client = await db.clients.find_one({"email": email}, {"_id": 0})
        
        if not client and email:
            # Create new client
            client_data = Client(
                name=email.split('@')[0],
                email=email,
                total_paid=amount
            )
            doc = client_data.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.clients.insert_one(doc)
            client_id = client_data.id
        elif client:
            client_id = client['id']
            # Update total paid
            new_total = client.get('total_paid', 0) + amount
            await db.clients.update_one(
                {"id": client_id},
                {"$set": {"total_paid": new_total}}
            )
        else:
            client_id = None
        
        # Create payment record
        payment_type = notes.get('type', 'One-Time')
        payment_data = Payment(
            client_id=client_id,
            client_name=email.split('@')[0] if email else 'Unknown',
            client_email=email,
            amount=amount,
            currency='INR',
            source='Razorpay',
            type=payment_type,
            date=datetime.now(timezone.utc),
            notes=str(notes)
        )
        doc = payment_data.model_dump()
        doc['date'] = doc['date'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.payments.insert_one(doc)
        
        logger.info(f"Razorpay payment captured: {email} - ₹{amount}")
    
    return {"status": "success"}

# ============ BOLTGUIDER ONBOARDING ENDPOINTS ============

@api_router.post("/leads/boltguider", response_model=BoltGuiderOnboarding, status_code=201)
async def create_boltguider_onboarding(data: BoltGuiderOnboardingCreate):
    """Create a new BoltGuider onboarding submission"""
    onboarding = BoltGuiderOnboarding(**data.model_dump())
    doc = onboarding.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.boltguider_onboarding.insert_one(doc)
    logger.info(f"BoltGuider onboarding: {onboarding.startup_name}")
    return onboarding

@api_router.get("/leads/boltguider", response_model=List[BoltGuiderOnboarding])
async def get_boltguider_onboarding(limit: int = 100):
    """Get all BoltGuider onboarding submissions"""
    submissions = await db.boltguider_onboarding.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for submission in submissions:
        if isinstance(submission.get('created_at'), str):
            submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    return submissions

# ============ CLARITY CHECK LEAD ENDPOINT ============

@api_router.post("/leads/clarity", response_model=Lead, status_code=201)
async def create_clarity_lead(lead_data: LeadCreate):
    """Create a lead from Stage Clarity Check"""
    lead_data.source_page = "Clarity Check"
    lead = Lead(**lead_data.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"Clarity Check lead: {lead.email}")
    return lead

# ============ MARKETING ACTIVITY ENDPOINTS ============

@api_router.post("/marketing/logs", response_model=MarketingLog, status_code=201)
async def create_marketing_log(log_data: MarketingLogCreate):
    """Create or update marketing activity log for a month"""
    # Check if log exists for this month/year
    existing = await db.marketing_logs.find_one(
        {"month": log_data.month, "year": log_data.year},
        {"_id": 0}
    )
    
    if existing:
        # Update existing log
        await db.marketing_logs.update_one(
            {"id": existing['id']},
            {"$set": log_data.model_dump()}
        )
        log = MarketingLog(**{**existing, **log_data.model_dump()})
    else:
        # Create new log
        log = MarketingLog(**log_data.model_dump())
        doc = log.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.marketing_logs.insert_one(doc)
    
    logger.info(f"Marketing log updated: {log_data.month}/{log_data.year}")
    return log

@api_router.get("/marketing/logs", response_model=List[MarketingLog])
async def get_marketing_logs(limit: int = 12):
    """Get marketing activity logs"""
    logs = await db.marketing_logs.find({}, {"_id": 0}).sort([("year", -1), ("month", -1)]).to_list(limit)
    for log in logs:
        if isinstance(log.get('created_at'), str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
    return logs

@api_router.get("/marketing/conversions", response_model=ConversionMetrics)
async def get_conversion_metrics(month: Optional[int] = None, year: Optional[int] = None):
    """Calculate conversion metrics"""
    from datetime import date
    
    # Use current month if not specified
    if not month or not year:
        now = datetime.now(timezone.utc)
        month = now.month
        year = now.year
    
    # Get marketing log for the month
    marketing_log = await db.marketing_logs.find_one(
        {"month": month, "year": year},
        {"_id": 0}
    )
    proposals_sent = marketing_log['proposals_sent'] if marketing_log else 0
    
    # Get total clarity leads for the month
    first_day = datetime(year, month, 1, tzinfo=timezone.utc)
    import calendar
    last_day = datetime(year, month, calendar.monthrange(year, month)[1], 23, 59, 59, tzinfo=timezone.utc)
    
    clarity_leads = await db.leads.count_documents({
        "source_page": "Clarity Check",
        "created_at": {"$gte": first_day.isoformat(), "$lte": last_day.isoformat()}
    })
    
    # Get total unique clients who paid this month
    payments_this_month = await db.payments.find({
        "date": {"$gte": first_day.isoformat(), "$lte": last_day.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    unique_clients_paid = len(set(p['client_id'] for p in payments_this_month if p.get('client_id')))
    
    # Calculate percentages
    lead_to_proposal = (proposals_sent / clarity_leads * 100) if clarity_leads > 0 else 0.0
    close_rate = (unique_clients_paid / proposals_sent * 100) if proposals_sent > 0 else 0.0
    
    # Overall clarity to close (all time)
    total_clarity_leads = await db.leads.count_documents({"source_page": "Clarity Check"})
    total_unique_clients = await db.clients.count_documents({"total_paid": {"$gt": 0}})
    clarity_to_close = (total_unique_clients / total_clarity_leads * 100) if total_clarity_leads > 0 else 0.0
    
    return ConversionMetrics(
        lead_to_proposal_percent=round(lead_to_proposal, 2),
        close_rate_percent=round(close_rate, 2),
        clarity_to_close_percent=round(clarity_to_close, 2)
    )

# Include the router in the main app
app.include_router(api_router)

# Health check endpoint for Kubernetes
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "founderplane-backend"}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
