import SongEditorComponent from "@songwalker-editor/SongEditorComponent";
import song from "./song/test.sw";

export default function Home() {
    // console.log('song', song)
    return (
        <>
            <header className="App-header">
            </header>
            <main className="flex flex-col items-center">
                <SongEditorComponent className="absolute left-0 right-0 top-0 bottom-0" initialValue={song.source}/>
            </main>
        </>
    )
}
