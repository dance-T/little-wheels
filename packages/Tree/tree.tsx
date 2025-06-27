import React from "react";
import { TreeProps, TreeNode } from "./type";
import "./styles.scss";

const Tree: React.FC<TreeProps> = ({ data, onChange }) => {
  return (
    <div>
      {data.map((node) => (
        <div className="tree-node" key={node.id}>
          <input type="checkbox" checked={node.selected} disabled={node.disabled} onChange={() => onChange?.(node)} />
          {node.name}
          {node.children && <Tree data={node.children} onChange={onChange} />}
        </div>
      ))}
    </div>
  );
};

export default Tree;
