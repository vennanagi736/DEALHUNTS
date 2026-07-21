import { useEffect, useState } from "react";

function Location() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location", error);
      }
    );
  }, []);

  return (
    <div>
      <h2>User Location</h2>
      {location ? (
        <p>
          Lat: {location.lat}, Lon: {location.lon}
        </p>
      ) : (
        <p>Getting location...</p>
      )}
    </div>
  );
}

export default Location;