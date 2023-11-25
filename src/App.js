import React, { useEffect, useState } from "react";
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk';
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

// ------- Update with your credentials ------------------ //
// const logicIdOld = "0x08000018e65fdf70762d38de7aa29eb9ace470b6c550f23eaa2ec659b8854947873617"
const logicId = "0x0800000abb8425afe55b5050d32317e893b277b0ca36373210d8f4bdfe22f2749e3063"
const mnemonic = "bounce change reduce guitar mouse code box sudden twelve taste fortune spike"

const logicDriver = await gettingLogicDriver(
  logicId,
  mnemonic,
  "m/44'/6174'/7020'/0/0"
)

async function gettingLogicDriver(logicId, mnemonic, accountPath) {
  const provider = new VoyageProvider("babylon")
  const wallet = new Wallet(provider)
  await wallet.fromMnemonic(mnemonic, accountPath)
  return await getLogicDriver(logicId, wallet)
}

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos")
      setTodos(tTodos)
      setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true)
      info("Adding Todo ...");

      const ix = await logicDriver.routines.Add([todoName]).send({
        fuelPrice: 1,
        // fuelLimit: 100,
        fuelLimit: 1000,
      });

      // Waiting for tesseract to be mined
      await ix.wait()

      await getTodos()
      success("Successfully Added");
      setTodoName("")
      setAdding(false)
    } catch (error) {
      setAdding(false)
      console.log(error);
    }
  };

  const markCompleted = async (id) => {
    try {
      setMarking(id)
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        // fuelLimit: 100,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();

      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false)
    } catch (error) {
      setMarking(false)
      console.log(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      console.log("deleting")
      setDeleting(id)
      const ix = await logicDriver.routines.DeleteTodo([id]).send({
        fuelPrice: 1,
        // fuelLimit: 100,
        fuelLimit: 1000,
      });
      // Waiting for tesseract to be mined
      await ix.wait();

      setTodos(todos.filter((todo, index) => index !== id));
      setDeleting(false)
      console.log("Deleted")
    } catch (error) {
      setDeleting(false)
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <section className="section-center">
        <form className="todo-form">
          <p className="alert"></p>
          <h3>Todo buddy</h3>
          <div className="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <button onClick={add} type="submit" className="submit-btn">
              {adding ? <Loader color={"#000"} loading={adding} /> : "Add Todo"}
            </button>
          </div>
        </form>
        {!loading ? <div className="todo-container show-container">
          {todos.map((todo, index) => {
            console.log(todo)
            return (
              <div key={index} className="todo-item">
                <span className="todo-item-text">
                  {todo.name}
                </span>
                <span className="todo-item-options">
                  {todo.completed ? (
                    <img className="icon" src="/images/check.svg" alt="checked" />
                  ) : (
                    <span
                      onClick={() => markCompleted(index)}
                      className="underline text-orange pointer"
                    >
                      {marking === index ? <Loader color={"#000"} loading={marking === 0 ? true : marking} /> :
                        "Mark Completed!"
                      }
                    </span>
                  )}
                  <span
                    onClick={() => deleteTodo(index)}
                    className="text-red pointer outline-0"
                  >
                    {deleting === index ? <Loader color={"#F00"} loading={deleting === 0 ? true : deleting} /> :
                      <span className="icon btn">X</span>}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
          :
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>}
      </section>
    </>
  );
}

export default App;
