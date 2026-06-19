export const CLASS_ORDER = [
  "Baby Class",
  "Middle Class",
  "Top Class",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
];

export const getClassLabel = (cls) => {
  if (typeof cls === "string") return cls;
  return (
    cls?.label || cls?.name || cls?.level || cls?.class_name || cls?.class_id?.toString() || ""
  ).toString();
};

export const sortClasses = (items) => {
  return [...items].sort((a, b) => {
    const labelA = getClassLabel(a);
    const labelB = getClassLabel(b);
    const indexA = CLASS_ORDER.indexOf(labelA);
    const indexB = CLASS_ORDER.indexOf(labelB);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export const sortClassLabels = (labels) => {
  return [...labels].sort((a, b) => {
    const aLabel = a?.toString() || "";
    const bLabel = b?.toString() || "";
    const indexA = CLASS_ORDER.indexOf(aLabel);
    const indexB = CLASS_ORDER.indexOf(bLabel);

    if (indexA === -1 && indexB === -1) return aLabel.localeCompare(bLabel);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

const CLASSES = [
  { id: 3, label: "Baby Class" },
  { id: 4, label: "Middle Class" },
  { id: 5, label: "Top Class" },
  { id: 6, label: "P1" },
  { id: 7, label: "P2" },
  { id: 8, label: "P3" },
  { id: 9, label: "P4" },
  { id: 10, label: "P5" },
  { id: 11, label: "P6" },
  { id: 12, label: "P7" },
];

export default CLASSES;
