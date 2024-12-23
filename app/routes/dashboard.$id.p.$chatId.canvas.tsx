import { useContext, useEffect } from 'react';
import { Tldraw, useEditor, track } from 'tldraw';
import 'tldraw/tldraw.css';
import { UserContext } from '~/context/userContext';
import { useYjsTldrawStore } from '~/hooks/use-yjs-tldraw-store';
import { ClientOnly } from 'remix-utils/client-only';
import { useParams } from '@remix-run/react';

export default function CanvasPage() {
  const params = useParams();
  const roomId = params?.chatId;
  return roomId && <ClientOnly>{() => <Canvas roomId={roomId} />}</ClientOnly>;
}

function Canvas({ roomId }: { roomId: string }) {
  const store = useYjsTldrawStore({
    roomId: roomId,
    hostUrl: import.meta.env.VITE_YWEBSOCKET_HOST_URL
  });

  return (
    <Tldraw
      autoFocus
      options={{
        maxPages: 3
      }}
      maxImageDimension={600}
      store={store}
      components={{
        SharePanel: NameEditor
      }}
    />
  );
}

const NameEditor = track(() => {
  const user = useContext(UserContext);

  const editor = useEditor();

  useEffect(() => {
    editor.user.updateUserPreferences({
      name: user?.firstName,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      colorScheme: 'system',
      id: user?.id
    });
  }, [user]);

  return <></>;
});
