import SongPlayer from "./components/SongPlayer";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">

            <div className="App">
                <header className="App-header">
                    <SongPlayer></SongPlayer>
                </header>
            </div>
        </main>
    )
}
