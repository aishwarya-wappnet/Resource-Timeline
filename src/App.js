import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [outsideItems, setOutsideItems] = useState([]);
  const [hours, setHours] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchGridData = async () => {
      // Mock API response
      const hoursData = [];
      for (let h = 8; h < 18; h++) {
        for (let m = 0; m < 60; m += 5) {
          const hour = h % 12 || 12;
          const period = h >= 12 ? "PM" : "AM";
          hoursData.push(`${hour}:${m < 10 ? "0" + m : m} ${period}`);
        }
      }

      const resourcesData = ["John", "Jane", "Jim", "Jack", "Jill"];
      const outsideItemsData = [
        { name: "Item 1", width: 24, id: 1 }, // Width in 5-minute intervals
        { name: "Item 2", width: 36, id: 2 },
        { name: "Item 3", width: 12, id: 3 },
        { name: "Item 4", width: 24, id: 4 },
        { name: "Item 5", width: 60, id: 5 },
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

  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const isPM = currentHours >= 12;
      const displayHours = currentHours % 12 || 12;
      const currentTimeString = `${displayHours}:${
        currentMinutes < 10 ? "0" + currentMinutes : currentMinutes
      } ${isPM ? "PM" : "AM"}`;
      console.log(currentTimeString);
      const index = hours.findIndex((hour) => hour === currentTimeString);
      if (index !== -1) {
        setCurrentTimePosition(index);
      }
    };

    updateCurrentTimePosition();
    const intervalId = setInterval(updateCurrentTimePosition, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [hours]);

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
    const itemWidthInSlots = droppedItem.width; // Width is already in 5-minute intervals
    const startTime = hours[index % gridWidth];
    const startTimeIndex = hours.findIndex((ele) => ele === startTime);
    const endTimeIndex = startTimeIndex + itemWidthInSlots;

    if (
      endTimeIndex > hours.length ||
      (index % gridWidth) + itemWidthInSlots > gridWidth
    ) {
      return; // Ensure the item does not overflow the grid
    }
    const endTime = hours[endTimeIndex - 1];

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
      const itemWidthInSlots = item.width; // Width is already in 5-minute intervals
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
          const showHour = hourParts[1].split(" ")[0] === "00";
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
          const span = item.width; // Width is already in 5-minute intervals
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
      {item.name}&nbsp;&nbsp;{item.width / 12} hr
    </div>
  ));

  return (
    <div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${hours?.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${resources?.length + 1}, 1fr)`,
          position: "relative", // Needed for the current time indicator positioning
        }}
      >
        {gridItems}
        {currentTimePosition !== null && (
          <div
            className="current-time-indicator"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(${
                (currentTimePosition / hours.length) * 100
              }% + 1fr)`,
              width: "2px",
              backgroundColor: "red",
            }}
          ></div>
        )}
      </div>
      <div className="outside-container">{outsideItemElements}</div>
    </div>
  );
}

export default App;
