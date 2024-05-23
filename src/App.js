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
    const startTime = hours[index % hours.length];
    const endTime = calculateTime(startTime, droppedItem.width);
    const endTimeIndex = hours.findIndex((ele) => ele === endTime);
    const startTimeIndex = hours.findIndex((ele) => ele === startTime);
    console.log(endTimeIndex - startTimeIndex + 1);
    const droppedItemEndIndex = index + endTimeIndex - startTimeIndex;

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
    for (let i = 0; i < endTimeIndex - startTimeIndex; i++) {
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
          const startTime = hours[index % hours.length];
          const endTime = calculateTime(startTime, item.width);
          const endTimeIndex = hours.findIndex((ele) => ele === endTime);
          const startTimeIndex = hours.findIndex((ele) => ele === startTime);
          const spanClass = `span-${endTimeIndex - startTimeIndex + 1}`;

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

function calculateTime(start, hoursToAdd) {
  // Get the time string at the given index

  const [hours, minutes] = start.split(":").map(Number);

  // Create a new Date object with the given hours and minutes
  const time = new Date();
  time.setHours(hours);
  time.setMinutes(minutes);

  // Add the hours to the time
  time.setHours(time.getHours() + hoursToAdd);

  // Format the resulting time into the desired format (hh:mm)
  const formattedTime = `${String(time.getHours()).padStart(2, "0")}:${String(
    time.getMinutes()
  ).padStart(2, "0")}`;

  return formattedTime;
}
