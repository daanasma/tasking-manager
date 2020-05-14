import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as iD from '@hotosm/id';
import '@hotosm/id/dist/iD.css';

import { OSM_CONSUMER_KEY, OSM_CONSUMER_SECRET } from '../config';
import { removeItem } from '../utils/safe_storage';

export default function Editor({ editorRef, setEditorRef, setDisable }) {
  const session = useSelector((state) => state.auth.get('session'));
  const windowInit = typeof window !== undefined;

  useEffect(() => {
    return () => {
      window.iD.coreContext('destroy');
      removeItem('comment');
      removeItem('hashtags');
      removeItem('commentDate');
    };
  }, []);

  useEffect(() => {
    if (windowInit && !editorRef) {
      setEditorRef(window.iD.coreContext());
    }
  }, [windowInit, setEditorRef, editorRef]);

  useEffect(() => {
    if (session && window.iD && editorRef) {
      editorRef
        .embed(true)
        .assetPath('/static/')
        .containerNode(document.getElementById('id-container'));
      editorRef.init();

      let osm = editorRef.connection();
      const auth = {
        urlroot: 'https://www.openstreetmap.org',
        oauth_consumer_key: OSM_CONSUMER_KEY,
        oauth_secret: OSM_CONSUMER_SECRET,
        oauth_token: session.osm_oauth_token,
        oauth_token_secret: session.osm_oauth_token_secret,
      };
      osm.switch(auth);

      const thereAreChanges = (changes) =>
        changes.modified.length || changes.created.length || changes.deleted.length;

      editorRef.history().on('change', () => {
        if (thereAreChanges(editorRef.history().changes())) {
          setDisable(true);
        } else {
          setDisable(false);
        }
      });
    }
  }, [session, editorRef, setDisable]);

  return <div className="w-100 vh-minus-122-ns" id="id-container"></div>;
}
