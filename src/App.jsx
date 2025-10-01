import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { AuthForm } from "./AuthForm";
import {
  collection,
  addDoc,
  // getDocs,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy, serverTimestamp
} from "firebase/firestore";
import { IoHomeOutline, IoCloseSharp, IoLogInOutline  } from "react-icons/io5";
import {
  MdOutlineWorkOutline,
  MdOutlineHealthAndSafety,
  MdOutlineEuroSymbol,
  MdLaptopChromebook,
  MdCheckCircleOutline,
  MdOutlineRadioButtonUnchecked,
  MdOutlineEdit, MdOutlineLogout 
} from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaRegSave, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { TbFilter } from "react-icons/tb";

function App() {
  // Mostrar modal de login
  const [showLoginModal, setShowLoginModal] = useState(false);
  // guest inicia en true para entrar automáticamente como invitado
  const [guest, setGuest] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setGuest(false);
        setShowLoginModal(false);
      } else if (!showLoginModal) {
        setGuest(true);
      }
    });
    return () => unsubscribe();
  }, [showLoginModal]);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'category'
  const [completedAtEnd, setCompletedAtEnd] = useState(true);

  // Categorías predefinidas con colores vibrantes para tema oscuro
  const categories = [
    {
      name: "Home",
      icon: <IoHomeOutline />,
      color: "bg-purple-500",
      lightColor: "bg-purple-500/20",
      textColor: "text-purple-400",
      borderColor: "border-purple-500",
    },
    {
      name: "Work",
      icon: <MdOutlineWorkOutline />,
      color: "bg-blue-500",
      lightColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      borderColor: "border-blue-500",
    },
    {
      name: "Health",
      icon: <MdOutlineHealthAndSafety />,
      color: "bg-green-500",
      lightColor: "bg-green-500/20",
      textColor: "text-green-400",
      borderColor: "border-green-500",
    },
    {
      name: "Economy",
      icon: <MdOutlineEuroSymbol />,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500",
    },
    {
      name: "Studies",
      icon: <MdLaptopChromebook />,
      color: "bg-orange-500",
      lightColor: "bg-orange-500/20",
      textColor: "text-orange-400",
      borderColor: "border-orange-500",
    },
    {
      name: "Others",
      icon: <HiDotsHorizontal />,
      color: "bg-red-500",
      lightColor: "bg-red-500/20",
      textColor: "text-red-400",
      borderColor: "border-red-500",
    },
  ];

  // Cargar tareas del localStorage al iniciar
  // Sincronizar tareas con Firestore o localStorage
  // useEffect(() => {
  //   if (guest) {
  //     const savedTasks = localStorage.getItem("todoTasks");
  //     setTasks(savedTasks ? JSON.parse(savedTasks) : []);
  //     return;
  //   }
  //   if (user) {
  //     const q = query(
  //       collection(db, "tasks"),
  //       where("uid", "==", user.uid),
  //       orderBy("createdAt", "desc")
  //     );
  //     const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //       const tasksData = [];
  //       querySnapshot.forEach((doc) => {
  //         tasksData.push({ id: doc.id, ...doc.data() });
  //       });
  //       setTasks(tasksData);
  //     });
  //     return () => unsubscribe();
  //   }
  //   setTasks([]);
  // }, [user, guest]);

  useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "tasks"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
    
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasksData = [];
    querySnapshot.forEach((doc) => {
      tasksData.push({ id: doc.id, ...doc.data() });
    });
    setTasks(tasksData);
    // console.log("USER:" + user)
  });

  return () => unsubscribe();
}, [user]);

useEffect(() => {
  if (!guest) return;
  const savedTasks = localStorage.getItem("todoTasks");
  setTasks(savedTasks ? JSON.parse(savedTasks) : []);
  // console.log("guest:" + guest)
}, [guest]);


  // Obtener color de categoría
  const getCategoryStyle = (categoryName) => {
    return categories.find((cat) => cat.name === categoryName) || categories[0];
  };

  // Filtrar tareas según categoría seleccionada
  const filteredTasks =
    filterCategory === "Todas"
      ? tasks
      : tasks.filter((task) => task.category === filterCategory);

  // Ordenar tareas según las opciones seleccionadas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Si "completadas al final" está activado, primero separamos por estado
    if (completedAtEnd && a.completed !== b.completed) {
      return a.completed - b.completed; // false (0) viene antes que true (1)
    }

    // Dentro de cada grupo (o si no separamos completadas), aplicar el orden principal
    switch (sortBy) {
      case "category":
        // Primero por categoría, luego por fecha
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);

      case "recent":
      default:
        // Más recientes primero
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // const pendingFilteredTasks = filteredTasks.filter((task) => !task.completed);

  // Agregar nueva tarea
  const addTask = async () => {
    if (newTask.trim() === "") return;
    if (guest) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        category: selectedCategory,
        createdAt: serverTimestamp(),
      };
      const updated = [...tasks, task];
      setTasks(updated);
      localStorage.setItem("todoTasks", JSON.stringify(updated));
      setShowAddModal(false);
      setNewTask("");
      return;
    }
    if (user) {
      const task = {
      text: newTask.trim(),
  completed: false,
  category: selectedCategory,
  createdAt: serverTimestamp(),
  uid: user.uid,
      };
      setShowAddModal(false);
      setNewTask("");
      try {
        await addDoc(collection(db, "tasks"), task);
      } catch (error) {
        console.error("Error al agregar tarea:", error);
      }
    }

  };

  // Cerrar modal con Escape
  const handleModalKeyPress = (e) => {
    if (e.key === "Escape") {
      setShowAddModal(false);
      setNewTask("");
    }
  };

  // Alternar estado de completado
  const toggleTask = async (id, completed) => {
    if (guest) {
      const updated = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setTasks(updated);
      localStorage.setItem("todoTasks", JSON.stringify(updated));
      return;
    }
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { completed: !completed });
  };

  // Eliminar tarea
  const deleteTask = async (id) => {
    if (guest) {
      const updated = tasks.filter((task) => task.id !== id);
      setTasks(updated);
      localStorage.setItem("todoTasks", JSON.stringify(updated));
      if (editingTask === id) {
        setEditingTask(null);
        setEditText("");
        setEditCategory("");
      }
      return;
    }
    await deleteDoc(doc(db, "tasks", id));
    if (editingTask === id) {
      setEditingTask(null);
      setEditText("");
      setEditCategory("");
    }
  };

  // Iniciar edición
  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingTask(null);
    setEditText("");
    setEditCategory("");
  };

  // Guardar edición
  const saveEditing = async () => {
    if (editText.trim() === "") return;
    if (guest) {
      const updated = tasks.map((task) =>
        task.id === editingTask
          ? { ...task, text: editText.trim(), category: editCategory }
          : task
      );
      setTasks(updated);
      localStorage.setItem("todoTasks", JSON.stringify(updated));
      setEditingTask(null);
      setEditText("");
      setEditCategory("");
      return;
    }
    const taskRef = doc(db, "tasks", editingTask);
    await updateDoc(taskRef, {
      text: editText.trim(),
      category: editCategory,
    });
    setEditingTask(null);
    setEditText("");
    setEditCategory("");
  };

  // Manejar Enter en edición
  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  // Estadísticas (solo tareas pendientes)
  // const totalPendingTasks = pendingFilteredTasks.length;

  // Contar tareas pendientes por categoría
  const getPendingTaskCountByCategory = (categoryName) => {
    return tasks.filter(
      (task) => task.category === categoryName && !task.completed
    ).length;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header with Filter Toggle y Login */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Todododos</h1>
          </div>

          <div className="flex gap-2">
            {tasks.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-10 h-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all shadow-lg"
                title="Filters"
              >
                <TbFilter />
              </button>
            )}
            {!user ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-10 h-10 flex items-center justify-center bg-cyan-600 border border-cyan-700 rounded-lg text-white hover:bg-cyan-700 transition-all shadow-lg"
                title="Login"
              >
                <IoLogInOutline />
              </button>
            ): (
              <button onClick={() => signOut(auth)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"><MdOutlineLogout /></button>
            )}
          </div>
        </div>
        {/* Modal de login */}
        {showLoginModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setShowLoginModal(false)}
          >
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Login</h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full transition-all"
                >
                  <IoCloseSharp />
                </button>
              </div>
              <AuthForm onGuest={() => { setGuest(true); setShowLoginModal(false); }} />
            </div>
          </div>
        )}

        {/* Filter Categories - Only show when toggled */}
        {showFilters && (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-4 mb-6">
            {/* Filter by Category */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TbFilter className="text-gray-300" />
                <span className="font-medium text-gray-200">
                  Filter by category
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory("Todas")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${filterCategory === "All"
                    ? "bg-white text-gray-900 shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    }`}
                >
                  All ({tasks.filter((task) => !task.completed).length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setFilterCategory(category.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all border ${filterCategory === category.name
                      ? `${category.color} text-white shadow-lg`
                      : `${category.lightColor} ${category.textColor} hover:opacity-80 ${category.borderColor}`
                      }`}
                  >
                    {category.name} (
                    {getPendingTaskCountByCategory(category.name)})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-300"
                >
                  <path d="M3 6h18" />
                  <path d="M7 12h10" />
                  <path d="M10 18h4" />
                </svg>
                <span className="font-medium text-gray-200">Order by</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${sortBy === "recent"
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy("category")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${sortBy === "category"
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    }`}
                >
                  Category
                </button>
              </div>
            </div>

            {/* Completed Tasks Position */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-300"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="9 12l2 2 4-4" />
                </svg>
                <span className="font-medium text-gray-200">
                  Show completed
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCompletedAtEnd(false)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${!completedAtEnd
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setCompletedAtEnd(true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${completedAtEnd
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    }`}
                >
                  Bottom
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">
                {filterCategory === "Todas" ? "🎯" : "📂"}
              </div>
              <p className="text-gray-300 text-lg mb-2">
                {filterCategory === "Todas"
                  ? "Without todododos"
                  : `Without todododos in ${filterCategory}`}
              </p>
              <p className="text-gray-400 text-sm">
                {filterCategory === "Todas"
                  ? "Click on the + button to add a todododo"
                  : "Change the filter or add a todododo"}
              </p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const categoryStyle = getCategoryStyle(task.category);
              const isEditing = editingTask === task.id;

              return (
                <div
                  key={task.id}
                  className={` ${!task.completed
                    ? categoryStyle.lightColor
                    : "bg-gray-800/60"
                    } backdrop-blur-sm border ${categoryStyle.borderColor
                    } rounded-lg shadow-xl py-2 px-2 flex items-center gap-3 transition-all duration-200 ${task.completed
                      ? "opacity-60"
                      : "hover:shadow-2xl hover:bg-gray-800/80"
                    }`}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    disabled={isEditing}
                    className={`transition-all ${task.completed
                      ? "text-gray-500"
                      : isEditing
                        ? "text-gray-600 cursor-not-allowed"
                        : `${categoryStyle.textColor}`
                      }`}
                  >
                    {task.completed ? (
                      <MdCheckCircleOutline className="text-3xl" />
                    ) : (
                      <MdOutlineRadioButtonUnchecked className="text-3xl" />
                    )}
                  </button>

                  <div className="flex-1 flex">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              onClick={() => setEditCategory(category.name)}
                              className={`px-2 py-1 rounded-full text-xs font-medium transition-all border ${editCategory === category.name
                                ? `${category.color} text-white shadow-lg`
                                : `${category.lightColor} ${category.textColor} hover:opacity-80 ${category.borderColor}`
                                }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleEditKeyPress}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <span
                          className={`px-2 py-1  ${categoryStyle.textColor} `}
                        >
                          {categoryStyle.icon}
                        </span>

                        <span
                          className={`transition-all cursor-pointer hover:text-cyan-300 ${task.completed
                            ? "line-through text-gray-400"
                            : "text-gray-200"
                            }`}
                          onClick={() => !task.completed && startEditing(task)}
                          title="Haz clic para editar"
                        >
                          {task.text}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEditing}
                          disabled={!editText.trim()}
                          className="w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-full transition-all disabled:text-gray-600"
                          title="Guardar (Enter)"
                        >
                          <FaRegSave />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-full transition-all"
                          title="Cancelar (Esc)"
                        >
                          <IoCloseSharp />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(task)}
                          disabled={task.completed}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${task.completed
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                            }`}
                          title="Editar tarea"
                        >
                          <MdOutlineEdit />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                          title="Eliminar tarea"
                        >
                          <FaRegTrashAlt />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-cyan-500/25 hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
          title="Add todododo"
        >
          <FaPlus />
        </button>

        {/* Add Task Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowAddModal(false)
            }
          >
            <div
              className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md"
              onKeyDown={handleModalKeyPress}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">New todododo</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full transition-all"
                >
                  <IoCloseSharp />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`p-2 rounded-full text-xl font-medium transition-all border ${selectedCategory === category.name
                        ? `${category.color} text-white shadow-lg`
                        : `${category.lightColor} ${category.textColor} hover:opacity-80 ${category.borderColor}`
                        }`}
                    >
                      {category.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="What will you do?"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTask("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTask.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
