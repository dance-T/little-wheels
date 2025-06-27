import { Tree, TreeNode } from "../packages/index";

export default function App() {
  const onChange = (data: any) => {
    console.log("data", data);
  };

  const data: TreeNode[] = [
    {
      id: 1,
      name: "1",
      children: [
        {
          id: 2,
          name: "2",
        },
        {
          id: 3,
          name: "3",
          selected: true,
        },
        {
          id: 4,
          name: "4",
          children: [
            {
              id: 5,
              name: "5",
              selected: true,
            },
            {
              id: 6,
              name: "6",
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "4",
    },
  ];

  return (
    <div className="App">
      <header className="App-header">hello world</header>
      <Tree data={data} onChange={onChange}></Tree>
    </div>
  );
}
