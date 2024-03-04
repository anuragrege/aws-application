import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { Button, View } from "@aws-amplify/ui-react";
import CreateEvent from "./CreateEvent";
import DisplayEvents from "./DisplayEvents";
import { listNotes } from "./graphql/queries";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [showCreateEvents, setShowCreateEvents] = useState(false);
  const [showEventsList, setShowEventsList] = useState(false);

  useEffect(() => {
    if (showEventsList) {
      fetchNotes();
    }
  }, [showEventsList]);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  return (
    <View className="App">
      {!showCreateEvents && !showEventsList && (
        <React.Fragment>
          <Button onClick={() => setShowCreateEvents(true)}>
            Create Event
          </Button>
          <Button onClick={() => setShowEventsList(true)}>
            Display Events
          </Button>
        </React.Fragment>
      )}

      {showCreateEvents && (
        <CreateEvent
          setShowCreateEvents={setShowCreateEvents}
          setShowEventsList={setShowEventsList}
        />
      )}

      {showEventsList && (
        <DisplayEvents
          setShowEventsList={setShowEventsList}
          fetchNotes={fetchNotes}
          notes={notes}
        />
      )}

      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default App;
