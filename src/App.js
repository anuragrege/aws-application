import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Image,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { generateClient } from "aws-amplify/api";
import { uploadData, getUrl, remove } from "aws-amplify/storage";

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
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await getUrl({ key: note.name });
          note.image = url.url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("name");
    const description = formData.get("description");
    const image = formData.get("image");

    const data = {
      name: name,
      description: description,
      image: image ? image.name : null,
    };

    if (image) {
      await uploadData({
        key: name,
        data: image,
      });
    }

    await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });

    setShowCreateEvents(false);
    setShowEventsList(true);
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({ key: name });
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
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
        <React.Fragment>
          <Button onClick={() => setShowCreateEvents(false)}>Back</Button>
          <Heading level={1}>Create Events</Heading>
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex direction="column" justifyContent="center">
              <TextField
                name="name"
                placeholder="Event Name"
                label="Event Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Event Description"
                label="Event Description"
                labelHidden
                variation="quiet"
                required
              />
              <input type="file" accept="image/*" name="image" />
              <Button type="submit" variation="primary">
                Create Event
              </Button>
            </Flex>
          </View>
        </React.Fragment>
      )}

      {showEventsList && (
        <React.Fragment>
          <Button onClick={() => setShowEventsList(false)}>Back</Button>
          <Heading level={2}>Current Events</Heading>
          <View margin="3rem 0">
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Text as="strong" fontWeight={500} fontSize={30}>
                  {note.name}
                </Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`Visual aid for ${note.name}`}
                    style={{ width: 400, height: 300 }}
                  />
                )}
                <Text className="des" as="span">
                  {note.description}
                </Text>
                <Button variation="link" onClick={() => deleteNote(note)}>
                  Delete event
                </Button>
              </Flex>
            ))}
          </View>
        </React.Fragment>
      )}

      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
