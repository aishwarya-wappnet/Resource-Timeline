import React, { useState } from "react";
import "./App.css";

function App() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [outsideItems, setOutsideItems] = useState([
    { name: "Item 1", width: 2, id: 1 },
    { name: "Item 2", width: 3, id: 2 },
    { name: "Item 3", width: 1, id: 3 },
    { name: "Item 4", width: 2, id: 4 },
    { name: "Item 5", width: 1, id: 5 },
  ]);

  const handleDrop = (boxIndex, width, itemName, itemId) => {
    console.log(boxIndex, width);
    const endIndex = boxIndex + width;
    console.log(endIndex);

    if (endIndex <= 64) {
      console.log("hi");
      const isSpaceAvailable = !droppedItems
        .slice(boxIndex, endIndex)
        .some(Boolean);

      if (isSpaceAvailable) {
        const updatedDroppedItems = [...droppedItems];
        for (let i = boxIndex; i < endIndex; i++) {
          updatedDroppedItems[i] = { name: itemName, id: itemId, width: width };
        }
        setDroppedItems(updatedDroppedItems);
        setOutsideItems(outsideItems.filter((item) => item.id !== itemId));
      }
    }
  };

  const handleDragOver = (e, i) => {
    e.preventDefault();
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  const handleOutsideDragStart = (e, item) => {
    handleDragStart(e, item);
  };

  const handleGridDragStart = (e, item) => {
    handleDragStart(e, item);
  };

  const handleGridDrop = (e, index) => {
    e.preventDefault();
    const droppedItem = JSON.parse(e.dataTransfer.getData("item"));
    console.log(droppedItem, droppedItems, index);
    if (!droppedItem) return;

    const existingItem = droppedItems[index];
    if (existingItem) {
      console.log("if");
      // If there's already an item in the dropped position, move the dropped item to this position
      const updatedDroppedItems = [...droppedItems];

      // Clear old positions of the dropped item
      droppedItems.forEach((item, i) => {
        if (item && item.id === droppedItem.id) {
          for (let j = 0; j < item.width; j++) {
            updatedDroppedItems[i + j] = null;
          }
        }
      });

      // Set the dropped item in its new position
      for (let i = 0; i < droppedItem.width; i++) {
        updatedDroppedItems[index + i] = droppedItem;
      }
      setDroppedItems(updatedDroppedItems);
    } else {
      // If the dropped position is empty, proceed with regular dropping logic
      const updatedDroppedItems = [...droppedItems];

      // Clear old positions of the dropped item
      droppedItems.forEach((item, i) => {
        if (item && item.id === droppedItem.id) {
          for (let j = 0; j < item.width; j++) {
            updatedDroppedItems[i + j] = null;
          }
        }
      });

      // Set the dropped item in its new position
      for (let i = 0; i < droppedItem.width; i++) {
        updatedDroppedItems[index + i] = droppedItem;
      }
      setDroppedItems(updatedDroppedItems);
    }
  };

  const gridItems = [];
  for (let i = 0; i < 64; i++) {
    const item = droppedItems[i];
    if (i % 8 === 0 && Math.floor(i / 8) === 0) gridItems.push("");
    if (i % 8 === 0 && i !== 0) {
      gridItems.push(
        <div key={i} className="box">
          John
        </div>
      );
    } else if (Math.floor(i / 8) === 0 && i !== 0)
      gridItems.push(
        <div key={i} className="box">
          8 am
        </div>
      );
    else {
      gridItems.push(
        <div
          key={i}
          className={`box ${item ? "highlight" : ""}`}
          onDrop={(e) => handleGridDrop(e, i)}
          onDragOver={(e) => handleDragOver(e, i)}
        >
          {item && (
            <div
              className="dropped-item"
              draggable
              onDragStart={(e) => handleGridDragStart(e, item)}
            >
              Item {item.id}
            </div>
          )}
        </div>
      );
    }
  }

  const outsideItemElements = outsideItems.map((item, index) => (
    <div
      key={index}
      className="outside-item"
      draggable
      onDragStart={(e) => handleOutsideDragStart(e, item)}
    >
      {item.name}
    </div>
  ));

  return (
    <div>
      <div className="grid">{gridItems}</div>
      <div className="outside-container">{outsideItemElements}</div>
    </div>
  );
}

export default App;
