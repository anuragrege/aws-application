import React, { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  View,
  Text,
  Image,
} from "@aws-amplify/ui-react";
import { remove } from "aws-amplify/storage";
import { deleteNote as deleteNoteMutation } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import { generateClient } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";

const client = generateClient();

const DisplayEvents = ({ setShowEventsList }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
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
      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      console.error("Error fetching notes:", error);
      setLoading(false); // Set loading to false even if there's an error
    }
  }

  const deleteNote = async ({ id, name }) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({ key: name });
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
    fetchNotes(); // Refresh notes after deletion
  };

  return (
    <React.Fragment>
      <Button onClick={() => setShowEventsList(false)}>Back</Button>
      <Heading level={2}>Current Events</Heading>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
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
      )}
    </React.Fragment>
  );
};

export default DisplayEvents;
