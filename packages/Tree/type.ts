export interface TreeNode {
  id: string | number;
  name: string;
  children?: TreeNode[];
  disabled?: boolean;
  selected?: boolean;
}

export interface TreeProps {
  data: TreeNode[];
  onChange?: (node: TreeNode) => void;
}
