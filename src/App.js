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
        "8:00",
        "8:15",
        "8:30",
        "8:45",
        "9:00",
        "9:15",
        "9:30",
        "9:45",
        "10:00",
        "10:15",
        "10:30",
        "10:45",
        "11:00",
        "11:15",
        "11:30",
        "11:45",
        "12:00",
        "12:15",
        "12:30",
        "12:45",
        "1:00",
        "1:15",
        "1:30",
        "1:45",
        "2:00",
        "2:15",
        "2:30",
        "2:45",
        "3:00",
        "3:15",
        "3:30",
        "3:45",
        "4:00",
        "4:15",
        "4:30",
        "4:45",
        "5:00",
        "5:15",
        "5:30",
        "5:45",
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
    const itemWidthInSlots = droppedItem.width * 4; // Each hour is divided into 4 slots (15 minutes each)
    const startTime = hours[index % gridWidth];
    const startTimeIndex = hours.findIndex((ele) => ele === startTime);
    const endTimeIndex = startTimeIndex + itemWidthInSlots;

    if (
      endTimeIndex > hours.length ||
      (index % gridWidth) + itemWidthInSlots > gridWidth
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
        for (let j = 0; j < itemWidthInSlots; j++) {
          updatedDroppedItems[i + j] = null;
        }
        break;
      }
    }

    // Check for overlap in the new position
    for (let i = 0; i < itemWidthInSlots; i++) {
      if (updatedDroppedItems[index + i]) {
        return; // If there's an overlap, do nothing
      }
    }

    // Set the dropped item in its new position
    for (let i = 0; i < itemWidthInSlots; i++) {
      updatedDroppedItems[index + i] = droppedItem;
    }

    setDroppedItems(updatedDroppedItems);
    setOutsideItems(outsideItems.filter((item) => item.id !== droppedItem.id));
  };

  const moveItemAhead = (index) => {
    const gridWidth = hours.length;
    const updatedDroppedItems = [...droppedItems];
    const item = updatedDroppedItems[index];

    if (item) {
      const itemWidthInSlots = item.width * 4; // Each hour is divided into 4 slots (15 minutes each)
      const newIndex = index + 1; // Move one step ahead

      if ((newIndex % gridWidth) + itemWidthInSlots <= gridWidth) {
        // Clear old position
        for (let i = 0; i < itemWidthInSlots; i++) {
          updatedDroppedItems[index + i] = null;
        }

        // Check for overlap in the new position
        for (let i = 0; i < itemWidthInSlots; i++) {
          if (updatedDroppedItems[newIndex + i]) {
            return; // If there's an overlap, do nothing
          }
        }

        // Set the item in its new position
        for (let i = 0; i < itemWidthInSlots; i++) {
          updatedDroppedItems[newIndex + i] = item;
        }

        setDroppedItems(updatedDroppedItems);
      }
    }
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
          const hour = hours[x - 1];
          const hourParts = hour.split(":");
          const showHour = hourParts[1] === "00";
          const spanColumns = showHour
            ? hours.filter((h) => h.startsWith(hourParts[0] + ":")).length
            : 0;

          if (showHour) {
            gridItems.push(
              <div
                key={index}
                className="box label"
                style={{ gridColumn: `span ${spanColumns}` }}
              >
                {hour}
              </div>
            );
            x += spanColumns - 1; // Skip the spanned columns
          }
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
          const span = item.width * 4; // Each hour is divided into 4 slots (15 minutes each)
          const endX = x + span - 1;

          if (endX <= gridWidth) {
            gridItems.push(
              <div
                key={index}
                className="box highlight"
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
                  onDoubleClick={() => moveItemAhead(itemIndex)}
                >
                  {item.name}
                </div>
              </div>
            );

            // Skip rendering cells covered by this event
            x += span - 1;
          }
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
      {item.name}&nbsp;&nbsp;{item.width}
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
