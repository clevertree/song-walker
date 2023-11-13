import {SongPlayerComponent, SongEditorComponent} from "./components/";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">

            <div className="App">
                <header className="App-header">
                    <SongPlayerComponent></SongPlayerComponent>
                </header>
                <SongEditorComponent/>
            </div>
        </main>
    )
}
