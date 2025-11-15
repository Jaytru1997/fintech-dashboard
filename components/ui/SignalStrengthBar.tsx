"use client";

interface SignalStrengthBarProps {
  value: number; // 0-100
  maxValue?: number; // Default 100
  segments?: number; // Number of rectangles, default 20
  className?: string;
}

export function SignalStrengthBar({ 
  value, 
  maxValue = 100, 
  segments = 20,
  className = "" 
}: SignalStrengthBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), maxValue);
  const valuePerSegment = maxValue / segments;
  const filledSegments = Math.floor(normalizedValue / valuePerSegment);
  const partialSegment = (normalizedValue % valuePerSegment) / valuePerSegment;

  // Calculate color for each segment (red to green gradient)
  const getSegmentColor = (index: number) => {
    const segmentValue = (index + 1) / segments; // 0.1, 0.2, ..., 1.0
    // Red at 0, green at 1
    const red = Math.round(255 * (1 - segmentValue));
    const green = Math.round(255 * segmentValue);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: segments }).map((_, index) => {
        const isFilled = index < filledSegments;
        const isPartial = index === filledSegments && partialSegment > 0;
        const color = getSegmentColor(index);
        
        // Filled segments: full opacity, partial: partial opacity, empty: gray with low opacity
        let backgroundColor = color;
        let opacity = 1;
        
        if (isFilled) {
          backgroundColor = color;
          opacity = 1;
        } else if (isPartial) {
          backgroundColor = color;
          opacity = partialSegment;
        } else {
          backgroundColor = 'rgb(75, 85, 99)'; // gray-600
          opacity = 0.3;
        }

        return (
          <div
            key={index}
            className="flex-1 h-4 rounded transition-all duration-300"
            style={{
              backgroundColor: backgroundColor,
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
}

