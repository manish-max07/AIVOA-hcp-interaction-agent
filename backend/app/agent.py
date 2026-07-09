import os
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from sqlalchemy.orm import Session
from .tools import make_tools

SYSTEM_PROMPT = """You are an AI assistant embedded in a pharma field rep's
CRM, helping log Healthcare Professional (HCP) interactions. The rep will
describe interactions, corrections, follow-ups, or ask for advice in plain
language. You must use the available tools to take action -- never just
describe what you would do. Pick exactly one tool per turn based on intent:
- new interaction being described -> log_interaction
- correcting an already-logged field -> edit_interaction
- scheduling a reminder/follow-up -> schedule_followup
- checking for risky/compliance language -> compliance_flag
- - asking what to do next -> suggest_next_best_action
- looking up or registering an HCP's profile details -> search_hcp
- asking about past interactions/history with an HCP -> get_interaction_history
After the tool runs, reply in one short, friendly sentence confirming what happened."""


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


def build_agent(db: Session, form_state: dict):
    llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0, api_key=os.getenv("GROQ_API_KEY"))
    tools = make_tools(db, form_state)
    llm_with_tools = llm.bind_tools(tools)

    def call_model(state: AgentState):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    graph = StateGraph(AgentState)
    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode(tools))
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", tools_condition)
    graph.add_edge("tools", "agent")

    return graph.compile()