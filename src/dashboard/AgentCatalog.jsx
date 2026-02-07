import React, { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Sprout,
  Dna,
  Layers,
  FlaskConical,
  Droplets,
  Bug,
  CloudSun,
  Scaling,
  CalendarCheck,
  Plane,
  Map,
  TrendingUp,
  Coins,
  Leaf,
  BarChart3,
  Truck,
  ShoppingCart,
  ShieldCheck,
  GraduationCap,
  FileCheck,
  Users,
  BrainCircuit,
  HelpCircle,
} from "lucide-react"
import "../styles/Dashboard/AgentCatalog.css"

// GET /api/agents
// GET /api/agents?category=...
// GET /api/agents/search?q=

const CATEGORIES = [
  "All",
  "Crop Planning & Growth",
  "Farm Operations & Automation",
  "Analytics & Optimization",
  "Supply Chain & Market Access",
  "Farmer Support & Education",
  "Orchestrator",
]

const ID_TO_CHAT_ROUTE = {
  "farm-orchestrator": "orchestrator",
  "crop-selector": "crop-selector",
  "seed-selection": "seed-selection",
  "soil-health": "soil-health",
  "fertilizer-advisor": "fertilizer-advisor",
  "irrigation-planner": "irrigation-planner",
  "pest-disease-diagnostic": "pest-diagnostic",
  "weather-watcher": "weather-watcher",
  "growth-stage-monitor": "growth-monitor",
  "task-scheduler": "task-scheduler",
  "machinery-equipment": "machinery-manager",
  "drone-command": "drone-commander",
  "farm-layout-mapping": "layout-mapper",
  "yield-predictor": "yield-predictor",
  "profit-optimization": "profit-optimizer",
  "carbon-sustainability": "sustainability-tracker",
  "market-intelligence": "market-intelligence",
  "logistics-storage": "logistics-storage",
  "input-procurement": "input-procurement",
  "crop-insurance-risk": "crop-insurance-risk",
  "farmer-coach": "farmer-coach",
  "compliance-certification": "compliance-certification",
  "community-engagement": "community-engagement",
}

const iconMap = {
  orchestrator: BrainCircuit,
  crop_selector: Sprout,
  seed_selection: Dna,
  soil_health: FlaskConical,
  fertilizer_advisor: Droplets,
  irrigation_planner: Scaling,
  pest_diagnostic: Bug,
  weather_watcher: CloudSun,
  growth_monitor: TrendingUp,
  task_scheduler: CalendarCheck,
  machinery_manager: Truck,
  drone_commander: Plane,
  layout_mapper: Map,
  yield_predictor: BarChart3,
  profit_optimizer: Coins,
  sustainability_tracker: Leaf,
  market_intelligence: Layers,
  logistics_storage: Truck,
  input_procurement: ShoppingCart,
  crop_insurance_risk: ShieldCheck,
  farmer_coach: GraduationCap,
  compliance_certification: FileCheck,
  community_engagement: Users,
}

const AGENT_ICON_SIZE = 18

const AgentIcon = ({ iconName, className }) => {
  const IconComponent = iconMap[iconName] || HelpCircle
  return <IconComponent className={className} size={AGENT_ICON_SIZE} />
}

function getChatUrl(agentId) {
  const route = ID_TO_CHAT_ROUTE[agentId]
  if (!route || route === "orchestrator") return "/dashboard/orchestrator"
  return `/dashboard/orchestrator/${route}`
}

const AGENTS = [
  {
    id: "farm-orchestrator",
    type: "CORE",
    category: "Orchestrator",
    title: "Farm Orchestrator",
    description: "The central brain that directs tasks to specialized agents.",
    icon: "orchestrator",
    tags: ["Task Delegation", "Conflict Resolution"],
  },
  {
    id: "crop-selector",
    type: "AGENT",
    category: "Crop Planning & Growth",
    title: "Crop Selector",
    description: "Recommend crops based on soil, climate, and market data.",
    icon: "crop_selector",
    tags: ["Soil Analysis", "Market Matching", "Risk Screening"],
  },
  {
    id: "seed-selection",
    type: "AGENT",
    category: "Crop Planning & Growth",
    title: "Seed Selection",
    description: "Select optimal seed varieties (GM, hybrid, traditional).",
    icon: "seed_selection",
    tags: ["Variety Recommendations", "Yield Potential", "Cost/Benefit"],
  },
  {
    id: "soil-health",
    type: "AGENT",
    category: "Crop Planning & Growth",
    title: "Soil Health",
    description: "Analyze NPK, pH, and organic content to suggest amendments.",
    icon: "soil_health",
    tags: ["Nutrient Analysis", "Amendment Plans", "pH Balancing"],
  },
  {
    id: "fertilizer-advisor",
    type: "AGENT",
    category: "Crop Planning & Growth",
    title: "Fertilizer Advisor",
    description: "Create dynamic fertilizer schedules.",
    icon: "fertilizer_advisor",
    tags: ["Schedule Creation", "Dosage Calculation", "Cost Controls"],
  },
  {
    id: "irrigation-planner",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Irrigation Planner",
    description: "Optimize watering based on weather and soil moisture.",
    icon: "irrigation_planner",
    tags: ["Smart Scheduling", "Water Conservation", "Sensor Inputs"],
  },
  {
    id: "pest-disease-diagnostic",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Pest & Disease Diagnostic",
    description: "Identify threats via description or image analysis.",
    icon: "pest_diagnostic",
    tags: ["Visual Diagnosis", "Treatment Plans", "Prevention"],
  },
  {
    id: "weather-watcher",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Weather Watcher",
    description: "Real-time monitoring and forecasting.",
    icon: "weather_watcher",
    tags: ["Hyperlocal Forecast", "Severe Alerts", "Spray Windows"],
  },
  {
    id: "growth-stage-monitor",
    type: "AGENT",
    category: "Crop Planning & Growth",
    title: "Growth Stage Monitor",
    description: "Track plant development against models.",
    icon: "growth_monitor",
    tags: ["Stage Tracking", "Anomaly Detection", "Next Actions"],
  },
  {
    id: "task-scheduler",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Task Scheduler",
    description: "Prioritize tasks based on urgency, resources, and crop stage.",
    icon: "task_scheduler",
    tags: ["Urgency Analysis", "Resource Matching", "Reminders"],
  },
  {
    id: "machinery-equipment",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Machinery & Equipment",
    description: "Manage maintenance and usage of farm equipment.",
    icon: "machinery_manager",
    tags: ["Maintenance Alerts", "Usage Optimization", "Downtime"],
  },
  {
    id: "drone-command",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Drone Command",
    description: "Control drone missions for scouting and spraying.",
    icon: "drone_commander",
    tags: ["Flight Planning", "Data Collection", "Mission Logs"],
  },
  {
    id: "farm-layout-mapping",
    type: "AGENT",
    category: "Farm Operations & Automation",
    title: "Farm Layout & Mapping",
    description: "Map fields, irrigation, infrastructure, and resources.",
    icon: "layout_mapper",
    tags: ["Field Zoning", "Infrastructure Planning", "GPS Layers"],
  },
  {
    id: "yield-predictor",
    type: "AGENT",
    category: "Analytics & Optimization",
    title: "Yield Predictor",
    description: "Forecast harvest volume using predictive models.",
    icon: "yield_predictor",
    tags: ["Volume Forecasting", "Historical Comparison", "Scenario Runs"],
  },
  {
    id: "profit-optimization",
    type: "AGENT",
    category: "Analytics & Optimization",
    title: "Profit Optimization",
    description: "Analyze costs and market prices to maximize margins.",
    icon: "profit_optimizer",
    tags: ["Cost Baselines", "Pricing Strategy", "ROI"],
  },
  {
    id: "carbon-sustainability",
    type: "AGENT",
    category: "Analytics & Optimization",
    title: "Carbon & Sustainability",
    description: "Track carbon footprint and regenerative practices.",
    icon: "sustainability_tracker",
    tags: ["Carbon Accounting", "Credit Qualification", "Reporting"],
  },
  {
    id: "market-intelligence",
    type: "AGENT",
    category: "Supply Chain & Market Access",
    title: "Market Intelligence",
    description: "Track prices and demand across markets.",
    icon: "market_intelligence",
    tags: ["Price Tracking", "Demand Forecasting", "Buyer Leads"],
  },
  {
    id: "logistics-storage",
    type: "AGENT",
    category: "Supply Chain & Market Access",
    title: "Logistics & Storage",
    description: "Optimize post-harvest handling and transport.",
    icon: "logistics_storage",
    tags: ["Route Planning", "Cold Chain", "Storage Mgmt"],
  },
  {
    id: "input-procurement",
    type: "AGENT",
    category: "Supply Chain & Market Access",
    title: "Input Procurement",
    description: "Source seeds, fertilizer, and inputs at best prices.",
    icon: "input_procurement",
    tags: ["Supplier Vetting", "Price Comparison", "Bulk Orders"],
  },
  {
    id: "crop-insurance-risk",
    type: "AGENT",
    category: "Supply Chain & Market Access",
    title: "Crop Insurance & Risk",
    description: "Manage coverage and claims for farm risk.",
    icon: "crop_insurance_risk",
    tags: ["Policy Matching", "Claim Assistance", "Loss Events"],
  },
  {
    id: "farmer-coach",
    type: "AGENT",
    category: "Farmer Support & Education",
    title: "Farmer Coach",
    description: "Personalized mentorship and advice.",
    icon: "farmer_coach",
    tags: ["Skill Building", "Local Best Practices", "Q&A"],
  },
  {
    id: "compliance-certification",
    type: "AGENT",
    category: "Farmer Support & Education",
    title: "Compliance & Certification",
    description: "Navigate regulations and certification requirements.",
    icon: "compliance_certification",
    tags: ["Audit Prep", "Standards Alignment", "Documentation"],
  },
  {
    id: "community-engagement",
    type: "AGENT",
    category: "Farmer Support & Education",
    title: "Community Engagement",
    description: "Connect with peers and cooperatives.",
    icon: "community_engagement",
    tags: ["Peer Networking", "Co-op Opportunities", "Events"],
  },
];

function TagPills({ tags }) {
  const shown = tags.slice(0, 2);
  const extra = tags.length - shown.length;

  return (
    <div className="agent-catalog-tags">
      {shown.map((t) => (
        <span key={t} className="agent-catalog-tag">
          {t}
        </span>
      ))}
      {extra > 0 && <span className="agent-catalog-tag agent-catalog-tag-more">+{extra}</span>}
    </div>
  )
}

export default function AgentCatalog() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState("All")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return AGENTS.filter((a) => {
      const categoryMatch = activeCategory === "All" ? true : a.category === activeCategory
      const queryMatch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))

      return categoryMatch && queryMatch
    })
  }, [activeCategory, query])

  // Inject heading into header-left
  useEffect(() => {
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft) {
      headerLeft.innerHTML = `
        <div class="agent-catalog-header-left">
          <h1 class="agent-catalog-title">Agent Swarm Catalog</h1>
          <div class="agent-catalog-subtitle">22 specialized AI agents ready to assist.</div>
        </div>
      `;
    }

    return () => {
      // Cleanup on unmount
      const headerLeft = document.querySelector('.header-left');
      if (headerLeft) {
        headerLeft.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="agent-catalog-page">
      <div className="agent-catalog-header">
        <div className="agent-catalog-header-right">
          <div className="agent-catalog-search">
            <span className="agent-catalog-search-icon" aria-hidden="true">
              <HelpCircle size={14} />
            </span>
            <input
              className="agent-catalog-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents..."
              aria-label="Search agents"
            />
          </div>
        </div>
      </div>

      <div className="agent-catalog-filters" role="tablist" aria-label="Agent categories">
        {CATEGORIES.map((c) => {
          const isActive = c === activeCategory
          return (
            <button
              key={c}
              type="button"
              className={`agent-catalog-chip ${isActive ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
              role="tab"
              aria-selected={isActive}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div className="agent-catalog-grid" role="list">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="agent-catalog-card"
            role="button"
            tabIndex={0}
            aria-label={`Open Smart Chat for ${a.title}`}
            onClick={() => navigate(getChatUrl(a.id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                navigate(getChatUrl(a.id))
              }
            }}
          >
            <div className="agent-catalog-card-top">
              <div className="agent-catalog-icon">
                <AgentIcon iconName={a.icon} />
              </div>
              <div className={`agent-catalog-badge ${a.type === "CORE" ? "core" : "agent"}`}>{a.type}</div>
            </div>

            <div className="agent-catalog-card-body">
              <div className="agent-catalog-card-title">{a.title}</div>
              <div className="agent-catalog-card-desc">{a.description}</div>
            </div>

            <div className="agent-catalog-card-footer">
              <TagPills tags={a.tags} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
