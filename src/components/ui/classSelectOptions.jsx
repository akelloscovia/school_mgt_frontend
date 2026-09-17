import { getClassLabel, groupClassesBySection } from "../../data/classes";

// Renders <option> elements for a class <select>, grouped into
// Kindergarten / Primary <optgroup> sections (falls back to "Other"
// for any class outside the standard 10, e.g. legacy/custom levels).
export default function ClassSelectOptions({ classes, renderLabel }) {
  const groups = groupClassesBySection(classes || []);
  const label = renderLabel || getClassLabel;

  return (
    <>
      {groups.map(({ section, items }) => (
        <optgroup key={section} label={section}>
          {items.map((cls) => {
            const value = typeof cls === "string" ? cls : cls.id;
            return (
              <option key={value} value={value}>
                {label(cls)}
              </option>
            );
          })}
        </optgroup>
      ))}
    </>
  );
}
