import React from 'react';
import { AgentManager } from '../lib/agents/managerRouter';

const Page: React.FC = () => {
  const agents = AgentManager.getAgents(); // Example function to get agents

  return (
    <div>
      <h1>Agent Management</h1>
      <ul>
        {agents.map(agent => (
          <li key={agent.id}>{agent.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Page;