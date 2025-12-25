
import React from 'react';
import { NeuralNode } from '../types';
import { NODES } from '../constants';

interface NodeIndicatorProps {
  activeNode: NeuralNode;
}

const NodeIndicator: React.FC<NodeIndicatorProps> = ({ activeNode }) => {
  const nodeInfo = NODES.find(n => n.id === activeNode) || NODES[0];

  return (
    <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-2 backdrop-blur-md">
      <div 
        className="w-3 h-3 rounded-full animate-pulse" 
        style={{ backgroundColor: nodeInfo.accent, boxShadow: `0 0 10px ${nodeInfo.accent}` }}
      />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Active Protocol</span>
        <span className="text-xs font-orbitron font-bold text-white uppercase">{nodeInfo.id}</span>
      </div>
    </div>
  );
};

export default NodeIndicator;
