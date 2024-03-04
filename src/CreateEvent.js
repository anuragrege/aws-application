import React from "react";
import { Button, Heading, TextField, Flex, View } from "@aws-amplify/ui-react";
import { uploadData } from "aws-amplify/storage";
import { createNote as createNoteMutation } from "./graphql/mutations";
import { generateClient } from "aws-amplify/api";
import "./App.css";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient();

const CreateEvent = ({ setShowCreateEvents, setShowEventsList }) => {
  const createNote = async (event) => {
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
  };

  return (
    <Authenticator>
      <Authenticator>
        {({ signOut }) => (
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
            <Button onClick={signOut}>Sign Out</Button>
          </React.Fragment>
        )}
      </Authenticator>
    </Authenticator>
  );
};

export default CreateEvent;
