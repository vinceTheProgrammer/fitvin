import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";

function App() {
  const COLORS = {
    RED: 'rgba(255, 0, 0, 0.7)',
    GREEN: 'rgba(0, 255, 0, 0.7)',
    YELLOW: 'rgba(255, 255, 0, 0.7)'
  }

  const [textAreaText, setTextAreaText] = createSignal("");
  const [workoutsObjectArray, setWorkoutsObjectArray] = createSignal<{name: string, sets: number, reps: number, weight: number}[] | null>(null);
  const [overlayColor, setOverlayColor] = createSignal(COLORS.RED);
  const [isLoaded, setLoaded] = createSignal(false);
  const store = new Store(".settings.dat");

  async function loadInput() {
    let val = await store.get("text");
    if (val === null) val = "";
    setTextAreaText(`${val.value}`);
    const workoutsObjectArray = createWorkoutsObjectArray(textAreaText());
    setWorkoutsObjectArray(workoutsObjectArray);
    setLoaded(true);
    setOverlayColor(COLORS.GREEN);
  }

  async function saveInput(input: string) {
    await store.set("text", { value: input });
    await store.save();
  }

  let isSaving = false;

  async function saveInputIfNeeded(input: string) {
    if (!isSaving) {
      isSaving = true;
      setOverlayColor(COLORS.YELLOW);
      try {
        await saveInput(input);
      } finally {
        isSaving = false;
        setOverlayColor(COLORS.GREEN);
      }
    }
  }

  async function updateWorkouts(e: InputEvent & { currentTarget: HTMLTextAreaElement; target: HTMLTextAreaElement; }) {
    setTextAreaText(e.currentTarget.value);
    const workoutsObjectArray = createWorkoutsObjectArray(textAreaText());
    setWorkoutsObjectArray(workoutsObjectArray);
    saveInputIfNeeded(textAreaText());
  }

  function createWorkoutsObjectArray(text: string) {
    const workouts = text.split("\n");
    const workoutsObjects = [];
    for (let i = 0; i < workouts.length; i++) {
      const workoutData = workouts[i].split(" ");
      const workoutName = workoutData[0];
      const workoutSets = !isNaN(Number(workoutData[1])) ? Number(workoutData[1]) : 0;
      const workoutReps = !isNaN(Number(workoutData[2])) ? Number(workoutData[2]) : 0;
      const workoutWeight = !isNaN(Number(workoutData[3])) ? Number(workoutData[3]) : 0;
      workoutsObjects.push({name: workoutName, sets: workoutSets, reps: workoutReps, weight: workoutWeight});
    }
    return workoutsObjects;
  }

  loadInput();

  return (
    <div class="container">

    <div class="save-status" style={{ 'background-color': overlayColor() }}></div>

    <textarea disabled={!isLoaded()} onInput={(e) => {updateWorkouts(e)}} value={textAreaText()}>
    </textarea>

    <textarea disabled={true} value={JSON.stringify(workoutsObjectArray())}></textarea>
    
    </div>
  );
}

export default App;
