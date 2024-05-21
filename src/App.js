import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [outsideItems, setOutsideItems] = useState([]);
  const [hours, setHours] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Simulate API call
    const fetchGridData = async () => {
      // Mock API response
      const hoursData = [
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
      ];
      const resourcesData = ["John", "Jane", "Jim", "Jack", "Jill"];
      const outsideItemsData = [
        { name: "Item 1", width: 2, id: 1 },
        { name: "Item 2", width: 3, id: 2 },
        { name: "Item 3", width: 1, id: 3 },
        { name: "Item 4", width: 2, id: 4 },
        { name: "Item 5", width: 5, id: 5 },
      ];

      setHours(hoursData);
      setResources(resourcesData);
      setDroppedItems(
        Array(hoursData.length * resourcesData.length).fill(null)
      );
      setOutsideItems(outsideItemsData);
    };

    fetchGridData();
  }, []);

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
    const gridWidth = hours.length;
    const droppedItemEndIndex = index + droppedItem.width;

    if (
      droppedItemEndIndex > droppedItems.length ||
      (index % gridWidth) + droppedItem.width > gridWidth
    ) {
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
    if (existingItem) {
      const existingItemEndIndex = index + existingItem.width;

      // Ensure the existing item can be moved to the old position of the dropped item
      const oldIndex = droppedItems.findIndex(
        (item) => item && item.id === droppedItem.id
      );
      const oldEndIndex = oldIndex + existingItem.width;

      if (
        oldEndIndex > droppedItems.length ||
        (oldIndex % gridWidth) + existingItem.width > gridWidth ||
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

  const gridItems = [];
  const gridWidth = hours.length;
  const gridHeight = resources.length;

  for (let y = 0; y <= gridHeight; y++) {
    for (let x = 0; x <= gridWidth; x++) {
      const index = y * (gridWidth + 1) + x;

      if (x === 0 && y === 0) {
        gridItems.push(<div key={index} className="box label"></div>);
      } else if (y === 0) {
        if (x <= gridWidth) {
          gridItems.push(
            <div key={index} className="box label">
              {hours[x - 1]}
            </div>
          );
        }
      } else if (x === 0) {
        gridItems.push(
          <div key={index} className="box label">
            {resources[y - 1]}
          </div>
        );
      } else {
        const itemIndex = (y - 1) * gridWidth + (x - 1);
        const item = droppedItems[itemIndex];

        if (item) {
          const span = item.width; // Width of the event
          const spanClass = `span-${span}`;

          gridItems.push(
            <div
              key={index}
              className={`box highlight ${spanClass}`}
              onDrop={(e) => handleGridDrop(e, itemIndex)}
              onDragOver={handleDragOver}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gridColumn: `span ${span}`,
              }}
            >
              <div
                className="dropped-item"
                draggable
                onDragStart={(e) => handleGridDragStart(e, item)}
              >
                {item.name}
              </div>
            </div>
          );

          // Skip rendering cells covered by this event
          x += span - 1;
        } else {
          gridItems.push(
            <div
              key={index}
              className="box"
              onDrop={(e) => handleGridDrop(e, itemIndex)}
              onDragOver={handleDragOver}
            ></div>
          );
        }
      }
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
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${hours?.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${resources?.length + 1}, 1fr)`,
        }}
      >
        {gridItems}
      </div>
      <div className="outside-container">{outsideItemElements}</div>
    </div>
  );
}

export default App;
