import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(express.static("images"));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// GET /places: Fetches and returns all available places.
app.get("/places", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));  // Simulate a delay of 3 seconds

  // return res.status(500).json();  // for displaying error in available-places.component.ts 
  // this will call error handled in available-places.component.ts and be displayed in available-places.component.html
  // when we change something in app.js (or any backend part) we need to npm start again (restart) to apply changes

  const fileContent = await fs.readFile("./data/places.json");  // Read places data from JSON file

  const placesData = JSON.parse(fileContent);   // Parse JSON content

  res.status(200).json({ places: placesData });   // Return places data as JSON
});

// GET /user-places: Fetches and returns the user's favorite places from user-places.json file
app.get("/user-places", async (req, res) => {
  const fileContent = await fs.readFile("./data/user-places.json");   // Read user-specific places data

  const places = JSON.parse(fileContent);    // Parse user places data

  res.status(200).json({ places });   // Return user places as JSON
});

// PUT /user-places: Adds a place to the user's list of favorite places in user-places.json file
app.put("/user-places", async (req, res) => {
  const placeId = req.body.placeId;    // Extract place ID from the request body

  const fileContent = await fs.readFile("./data/places.json");
  const placesData = JSON.parse(fileContent);

  const place = placesData.find((place) => place.id === placeId);   // Find the place by its ID

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  let updatedUserPlaces = userPlacesData;

  if (!userPlacesData.some((p) => p.id === place.id)) {
    updatedUserPlaces = [...userPlacesData, place];   // Add the place to user places if it's not already in the list
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)    // Save updated user places to file
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });   // Return updated user places
});

// DELETE /user-places/:id: Removes a place from the user's list of favorite places in user-places.json file
app.delete("/user-places/:id", async (req, res) => {
  const placeId = req.params.id;   // Extract place ID from the request parameters

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  const placeIndex = userPlacesData.findIndex((place) => place.id === placeId);   // Find the place by ID

  let updatedUserPlaces = userPlacesData;

  if (placeIndex >= 0) {
    updatedUserPlaces.splice(placeIndex, 1);   // Remove the place from the list
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)  // Save updated list to file
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });  // Return updated user places
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();  // If the request is an OPTIONS request, skip to the next middleware
  }
  res.status(404).json({ message: "404 - Not Found" });   // Return a 404 error for unrecognized routes
});

// places.json: Contains a list of all available places.
// user-places.json: Contains a list of places that a specific user has marked as favorites.

app.listen(3000); // Starts the Express server and listens on port 3000. The backend will be accessible at http://localhost:3000.
