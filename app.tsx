import { registerRootComponent } from "expo";
import Root from "./src/App"; // <-- ajuste selon ton vrai chemin

export default function App() {
  return <Root />;
}

registerRootComponent(App);
