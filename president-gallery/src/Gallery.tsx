import { useState } from "react";
import Portrait from "./Portrait";
import "./Gallery.css";

export default function Gallery({ portraits }) {
  const [selectedPresident, setSelectedPresident] = useState(null);

  // console.log('Gallery rendering, selected president:', selectedPresident ? selectedPresident.name : 'none');
  return (
    <div className="presidents">
      {portraits.map((portraitData) => (
        <Portrait
          key={portraitData.filename}
          portraitData={portraitData}
          onClick={() => {
            // console.log('Portrait clicked:', portraitData.name); // Add console.log here
            setSelectedPresident(portraitData);
          }}
        />
      ))}
      {selectedPresident && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "white",
          }}
          onClick={() => setSelectedPresident(null)} // Close details when clicking the background
        >
          <div
            className="details-container"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up to the background
          >
            <div className="img-container">
                        <img
              src={`./portraits/${selectedPresident.filename}`}
              alt={selectedPresident.filename}
            />
            </div>
            <div className="text-container">
            <h1>President Details</h1>
            <h2>{selectedPresident.name}</h2>
            <div className="detail">
            <span className="label">Years of Presidency:</span><span className="value">{selectedPresident.date}</span></div>
            <h3>Hometown: </h3><p>{selectedPresident.state}</p>
            <h3>Party: </h3><p>{selectedPresident.party}</p>
            <h3>Occupation: </h3><p>{selectedPresident.occupation}</p>
            <h3>Fun Fact: </h3><p>{selectedPresident.fun_fact}</p>
            <h3>Quotes: </h3>
            <ul>
              {selectedPresident.quotes.map((quote, index) => (
                <li key={index}>{quote}</li>
              ))}
            </ul>
            <h3>Age at Inauguration: </h3> <p>{selectedPresident.age}</p>
            <h3>Spouse: </h3><p>{selectedPresident.spouse}</p>
            <h3>Children: {selectedPresident.children}</h3>
            <h3>Terms: {selectedPresident.terms}</h3>
            <h3>Vice President: </h3><p>{selectedPresident.vice_president}</p>
            <h3>Death: </h3><p>{selectedPresident.death}</p>
            <h3>Birth: </h3><p>{selectedPresident.birth}</p>
            <h3>Nickname: </h3><p>{selectedPresident.nickname}</p>
            </div>
          </div>
          <button className="buttonClass" onClick={() => setSelectedPresident(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
