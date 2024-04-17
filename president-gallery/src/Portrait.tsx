export default function Portrait({ portraitData, onClick}) {
    const imageUrl = `./portraits/${portraitData.filename}`;

    return (
      <div className="portrait" onClick={onClick}>
        <img src={imageUrl} alt={portraitData.filename} />
        <p>{portraitData.name}</p>
      </div>
    );
}