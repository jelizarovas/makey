import React, { useEffect, useRef, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import { RxDragHandleDots2 } from "react-icons/rx";

import { Resizable, ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { fieldArray } from "./KeyForm";

const DPI = 72; // Use 72 DPI for consistency with the PDF

const pixelsToInches = (pixels) => pixels / DPI;
const inchesToPixels = (inches) => inches * DPI;

const DraggableText = ({
  id,
  text,
  position,
  onDragEnd,
  onTextChange,
  size,
  onResize,
  handleFontSize,
}) => {
  const dragHandleRef = useRef(null);

  const draggableProps = useDraggable({ id, node: dragHandleRef });

  const containerRef = useRef(null);
  const textRef = useRef(null);

  const style = {
    transform: `translate3d(${
      position.x + (draggableProps?.transform ? draggableProps?.transform.x : 0)
    }px, ${
      position.y + (draggableProps?.transform ? draggableProps?.transform.y : 0)
    }px, 0)`,
    position: "absolute",
    // cursor: "grab",
  };

  const handleInputChange = (e) => {
    onTextChange(id, e.target.value);
  };

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const calculatedFontSize = adjustFontSizeToFitContainer(
        containerRef.current,
        textRef.current
      );
      handleFontSize(id, calculatedFontSize);
    }
  }, [size, text]);

  return (
    <div
      ref={draggableProps?.setNodeRef}
      style={style}
      onDragEnd={onDragEnd}
      className="relative group  rounded  custom-border-box  bg-white bg-opacity-20"
    >
      <div
        ref={dragHandleRef}
        className="p-2 absolute hidden group-hover:block -right-7 top-0 "
        {...draggableProps?.listeners}
        {...draggableProps?.attributes}
      >
        <RxDragHandleDots2 />
      </div>
      <div
        ref={dragHandleRef}
        className="p-2 absolute hidden group-hover:block -left-7 top-0 "
        {...draggableProps?.listeners}
        {...draggableProps?.attributes}
      >
        <RxDragHandleDots2 />
      </div>
      <ResizableBox
        width={size.width}
        height={size.height}
        onResizeStop={(event, { size }) => {
          onResize(id, size);
        }}
      >
        <div ref={containerRef} className="w-full h-full">
          <input
            value={text}
            onChange={handleInputChange}
            ref={textRef}
            className="w-full h-full bg-transparent outline-none"
          />
        </div>
      </ResizableBox>
    </div>
  );
};

export const TagEditor = () => {
  const [texts, setTexts] = useState(fieldArray);

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    setTexts((currentTexts) =>
      currentTexts.map((text) => {
        if (text.id === active.id) {
          return {
            ...text,
            position: {
              x: text.position.x + delta.x,
              y: text.position.y + delta.y,
            },
          };
        }
        return text;
      })
    );
  };

  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      text: "New Text",
      position: { x: 0, y: 0 },
      size: { width: 80, height: 20 },
    };
    setTexts([...texts, newText]);
  };

  const handleTextChange = (id, newText) => {
    setTexts(
      texts.map((text) => (text.id === id ? { ...text, text: newText } : text))
    );
  };

  const handleResize = (id, newSize) => {
    setTexts(
      texts.map((text) => (text.id === id ? { ...text, size: newSize } : text))
    );
  };

  const handleFontSize = (id, newFontSize) => {
    setTexts(
      texts.map((text) =>
        text.id === id ? { ...text, fontSize: newFontSize } : text
      )
    );
  };

  return (
    <div className="bg-indigo-100">
      <button onClick={addText}>Add Text</button>

      <div
        style={{
          width: "3in",
          height: "3in",
          backgroundImage: "url(/makey/tag.jpg)",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
          // modifiers={{ restrictToVerticalAxis }}
        >
          {texts.map((item) => (
            <DraggableText
              key={item.id}
              id={item.id}
              text={item.text}
              position={item.position}
              onTextChange={handleTextChange}
              size={item.size || { width: "1in", height: "1in" }} // Default size
              onResize={handleResize}
              handleFontSize={handleFontSize}
            />
          ))}
        </DndContext>
      </div>
      {/* <pre className="text-[8px]">{JSON.stringify(texts, null, 2)}</pre> */}
    </div>
  );
};

function adjustFontSizeToFitContainer(containerElem, textElem) {
  // Create a temporary span for measurement
  const measurementSpan = document.createElement("span");
  measurementSpan.style.visibility = "hidden"; // Hide the span
  measurementSpan.style.position = "absolute";
  measurementSpan.style.whiteSpace = "nowrap"; // Prevent line breaks
  measurementSpan.innerText = textElem.value || textElem.innerText;
  document.body.appendChild(measurementSpan); // Append to body for measurement

  let fontSize = 10; // Start with a base font size
  const maxWidth = containerElem.clientWidth;
  const maxHeight = containerElem.clientHeight;

  console.log({ maxWidth, maxHeight });

  // Increase font size until it overflows the container
  while (fontSize < 350) {
    // Set an upper limit to avoid infinite loops
    measurementSpan.style.fontSize = `${fontSize}px`;
    if (
      measurementSpan.scrollWidth > maxWidth ||
      measurementSpan.scrollHeight > maxHeight
    ) {
      textElem.style.fontSize = `${fontSize - 1}px`;
      break;
    }
    fontSize++;
  }

  document.body.removeChild(measurementSpan); // Clean up
  return fontSize - 1; // Return the final font size
}
