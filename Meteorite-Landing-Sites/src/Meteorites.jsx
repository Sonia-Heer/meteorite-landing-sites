import React from "react";
import { useState, useEffect } from "react";
import Globe from "./Map";

function Meteorite() {
  const [meteorites, setMeteorites] = useState([]);

  useEffect(() => {
    fetch("https://data.nasa.gov/resource/gh4g-9sfh.json")
      .then((response) => response.json())
      .then((data) => {
        setMeteorites(data);
      });
  }, []);

  return (
    <div>
      <Globe meteorites={meteorites} />
    </div>
  );
}

export default Meteorite;
// my token = pk.eyJ1Ijoiam9lbHltb2RldnMiLCJhIjoiY2xoeXU4NDhsMDBycTNmbjd6MDVyYnF6dCJ9.J7F_5p-QBI2VAGRjnAnx6w

