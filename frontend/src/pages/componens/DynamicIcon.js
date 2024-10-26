import React, { Suspense } from 'react';

const DynamicIcon = ({ iconName, size = 24, color = 'currentColor' }) => {
  const [Icon, setIcon] = React.useState(null);

  React.useEffect(() => {
    if (iconName) {
      import(`lucide-react`).then((module) => {
        const ImportedIcon = module[iconName];
        if (ImportedIcon) {
          setIcon(() => ImportedIcon); // Set icon if it exists
        } else {
          console.error(`Icon "${iconName}" not found in lucide-react.`);
        }
      });
    }
  }, [iconName]);

  if (!Icon) return null;

  return (
    <Suspense fallback={<span>Loading...</span>}>
      <div className="w-12 h-12 mx-auto mb-6">
        <Icon size={size} color={color} />
      </div>
    </Suspense>
  );
};

export default DynamicIcon;
