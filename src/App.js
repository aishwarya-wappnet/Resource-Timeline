import React, { useState } from "react";
import "./App.css";

function App() {
  const [droppedItems, setDroppedItems] = useState(Array(84).fill(null));
  const [outsideItems, setOutsideItems] = useState([
    { name: "Item 1", width: 2, id: 1 },
    { name: "Item 2", width: 3, id: 2 },
    { name: "Item 3", width: 1, id: 3 },
    { name: "Item 4", width: 2, id: 4 },
    { name: "Item 5", width: 5, id: 5 },
  ]);

  const handleDragOver = (e) => {
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
    const droppedItemEndIndex = index + droppedItem.width;

    if (droppedItemEndIndex > 84) {
      return; // Ensure the item does not overflow the grid
    }

    const updatedDroppedItems = [...droppedItems];

    // Clear old positions of the dropped item
    for (let i = 0; i < updatedDroppedItems.length; i++) {
      if (
        updatedDroppedItems[i] &&
        updatedDroppedItems[i].id === droppedItem.id
      ) {
        for (let j = 0; j < droppedItem.width; j++) {
          updatedDroppedItems[i + j] = null;
        }
        break;
      }
    }

    const existingItem = droppedItems[index];
    console.log(existingItem);
    if (existingItem) {
      const existingItemEndIndex = index + existingItem.width;

      // Ensure the existing item can be moved to the old position of the dropped item
      const oldIndex = droppedItems.findIndex(
        (item) => item && item.id === droppedItem.id
      );
      const oldEndIndex = oldIndex + existingItem.width;

      if (
        oldEndIndex > 84 ||
        droppedItems
          .slice(oldIndex, oldEndIndex)
          .some((item) => item && item.id !== droppedItem.id)
      ) {
        return;
      }

      // Move the existing item to the old position of the dropped item
      for (let i = 0; i < existingItem.width; i++) {
        updatedDroppedItems[oldIndex + i] = existingItem;
      }

      // Clear the old position of the existing item
      for (let i = index; i < existingItemEndIndex; i++) {
        updatedDroppedItems[i] = null;
      }
    }

    // Set the dropped item in its new position
    for (let i = 0; i < droppedItem.width; i++) {
      updatedDroppedItems[index + i] = droppedItem;
    }

    setDroppedItems(updatedDroppedItems);
    setOutsideItems(outsideItems.filter((item) => item.id !== droppedItem.id));
  };

  const hours = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
  ];
  const resources = ["John", "Jane", "Jim", "Jack", "Jill"];

  const gridItems = [];
  for (let i = 0; i < 84; i++) {
    const x = i % 14;
    const y = Math.floor(i / 14);
    const item = droppedItems[i];

    if (x === 0 && y === 0) {
      gridItems.push(<div key={i} className="box label"></div>);
    } else if (y === 0) {
      gridItems.push(
        <div key={i} className="box label">
          {hours[x - 1]}
        </div>
      );
    } else if (x === 0) {
      gridItems.push(
        <div key={i} className="box label">
          {resources[y - 1]}
        </div>
      );
    } else {
      gridItems.push(
        <div
          key={i}
          className={`box ${item ? "highlight" : ""}`}
          onDrop={(e) => handleGridDrop(e, i)}
          onDragOver={handleDragOver}
        >
          {item && (
            <div
              className="dropped-item"
              draggable
              onDragStart={(e) => handleGridDragStart(e, item)}
            >
              {item.name}
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
