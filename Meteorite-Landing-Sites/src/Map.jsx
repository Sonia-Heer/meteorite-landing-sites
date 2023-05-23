import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9lbHltb2RldnMiLCJhIjoiY2xoeXU4NDhsMDBycTNmbjd6MDVyYnF6dCJ9.J7F_5p-QBI2VAGRjnAnx6w"; // Replace with your Mapbox access token

const Globe = ({ meteorites }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const initMap = () => {
      const newMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v11",
        center: [53.9020423,-1.6839128],
        zoom: 5,
      });
      setMap(newMap);
    };

    if (!map) {
      initMap();
    }
  }, [map]);

  useEffect(() => {
    const addMarkers = () => {
      if (!map) return;

      const markers = meteorites
        .map((meteorite) => {
          const { name, mass, year, reclat, reclong } = meteorite;

          if (!isNaN(reclat) && !isNaN(reclong)) {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [reclong, reclat],
              },
              properties: {
                description: `<p>Name: ${name}</p>
              <p>Mass: ${mass}g </p>
              <p>Year: ${year}</p>
              <p>Location: ${reclat}, ${reclong}</p>`,
              },
            };
          }

          return null;
        })
        .filter(Boolean);

      map.on("load", () => {
        map.addSource("meteorites", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: markers,
          },
          cluster: true, 
          clusterMaxZoom: 50, 
          clusterRadius: 50, 
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "meteorites",
          filter: ["has", "point_count"], 
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "meteorites",
          filter: ["has", "point_count"], 
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "meteorites",
          filter: ["!", ["has", "point_count"]], 
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });

        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties.cluster_id;
          map
            .getSource("meteorites")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "unclustered-point", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const { description } = e.features[0].properties;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });
      });
    };

    const limit = setTimeout(addMarkers, 800);

    return () => {
      clearTimeout(limit);
    };
  }, [meteorites, map]);

  return <div id="map" style={{ width: "2000px", height: "700px" }}></div>;
};

export default Globe;
