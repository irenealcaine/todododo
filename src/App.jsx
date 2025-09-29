import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Tag, Filter, Edit3, Save, X } from "lucide-react";

function App() {
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
      name: "Personal",
      color: "bg-cyan-500",
      lightColor: "bg-cyan-500/20",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500",
    },
    {
      name: "Trabajo",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500",
    },
    {
      name: "Estudio",
      color: "bg-purple-500",
      lightColor: "bg-purple-500/20",
      textColor: "text-purple-400",
      borderColor: "border-purple-500",
    },
    {
      name: "Casa",
      color: "bg-orange-500",
      lightColor: "bg-orange-500/20",
      textColor: "text-orange-400",
      borderColor: "border-orange-500",
    },
    {
      name: "Salud",
      color: "bg-pink-500",
      lightColor: "bg-pink-500/20",
      textColor: "text-pink-400",
      borderColor: "border-pink-500",
    },
  ];

  // Cargar tareas del localStorage al iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem("todoTasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Migrar tareas antiguas sin categoría
      const migratedTasks = parsedTasks.map((task) => ({
        ...task,
        category: task.category || "Personal",
      }));
      setTasks(migratedTasks);
    }
  }, []);

  // Guardar tareas en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

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

  const pendingFilteredTasks = filteredTasks.filter((task) => !task.completed);

  // Agregar nueva tarea
  const addTask = () => {
    if (newTask.trim() !== "") {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        category: selectedCategory,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, task]);
      setNewTask("");
      setShowAddModal(false);
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
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Eliminar tarea
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    // Cancelar edición si se está editando la tarea que se elimina
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
  const saveEditing = () => {
    if (editText.trim() !== "") {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask
            ? { ...task, text: editText.trim(), category: editCategory }
            : task
        )
      );
      setEditingTask(null);
      setEditText("");
      setEditCategory("");
    }
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
  const totalPendingTasks = pendingFilteredTasks.length;

  // Contar tareas pendientes por categoría
  const getPendingTaskCountByCategory = (categoryName) => {
    return tasks.filter(
      (task) => task.category === categoryName && !task.completed
    ).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Filter Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              📝 Mis Tareas
            </h1>
            <p className="text-gray-300">
              {totalPendingTasks > 0
                ? `${totalPendingTasks} tarea${
                    totalPendingTasks !== 1 ? "s" : ""
                  } pendiente${totalPendingTasks !== 1 ? "s" : ""}`
                : "Todo al día"}
            </p>
          </div>

          {tasks.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all shadow-lg"
              title="Filtros"
            >
              <Filter size={20} />
            </button>
          )}
        </div>

        {/* Filter Categories - Only show when toggled */}
        {showFilters && (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-4 mb-6">
            {/* Filter by Category */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} className="text-gray-300" />
                <span className="font-medium text-gray-200">
                  Filtrar por categoría:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory("Todas")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filterCategory === "Todas"
                      ? "bg-white text-gray-900 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  Todas ({tasks.filter((task) => !task.completed).length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setFilterCategory(category.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all border ${
                      filterCategory === category.name
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
                <span className="font-medium text-gray-200">Ordenar por:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    sortBy === "recent"
                      ? "bg-cyan-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  🕐 Fecha (recientes primero)
                </button>
                <button
                  onClick={() => setSortBy("category")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    sortBy === "category"
                      ? "bg-cyan-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  🏷️ Categoría (A-Z)
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
                  Tareas completadas:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCompletedAtEnd(false)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    !completedAtEnd
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  🔀 Mezcladas (por orden)
                </button>
                <button
                  onClick={() => setCompletedAtEnd(true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    completedAtEnd
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  ⬇️ Al final
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
                  ? "¡Sin tareas pendientes!"
                  : `Sin tareas en ${filterCategory}`}
              </p>
              <p className="text-gray-400 text-sm">
                {filterCategory === "Todas"
                  ? "Presiona el botón + para agregar tu primera tarea"
                  : "Cambia el filtro o agrega una nueva tarea"}
              </p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const categoryStyle = getCategoryStyle(task.category);
              const isEditing = editingTask === task.id;

              return (
                <div
                  key={task.id}
                  className={`bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-4 flex items-center gap-3 transition-all duration-200 ${
                    task.completed
                      ? "opacity-60"
                      : "hover:shadow-2xl hover:bg-gray-800/80"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    disabled={isEditing}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 border-green-400 text-white shadow-lg"
                        : isEditing
                        ? "border-gray-600 cursor-not-allowed"
                        : "border-gray-500 hover:border-green-400 hover:bg-green-400/10"
                    }`}
                  >
                    {task.completed && <Check size={16} />}
                  </button>

                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              onClick={() => setEditCategory(category.name)}
                              className={`px-2 py-1 rounded-full text-xs font-medium transition-all border ${
                                editCategory === category.name
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
                        {!showFilters && (
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryStyle.lightColor} ${categoryStyle.textColor} ${categoryStyle.borderColor}`}
                            >
                              {task.category}
                            </span>
                          </div>
                        )}
                        <span
                          className={`transition-all cursor-pointer hover:text-cyan-300 ${
                            task.completed
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
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-full transition-all"
                          title="Cancelar (Esc)"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(task)}
                          disabled={task.completed}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                            task.completed
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                          }`}
                          title="Editar tarea"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={16} />
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
          title="Agregar nueva tarea"
        >
          <Plus size={24} />
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
                <h3 className="text-xl font-semibold text-white">
                  Nueva Tarea
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Categoría:
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all border ${
                        selectedCategory === category.name
                          ? `${category.color} text-white shadow-lg`
                          : `${category.lightColor} ${category.textColor} hover:opacity-80 ${category.borderColor}`
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Descripción:
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="¿Qué necesitas hacer?"
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
                  Cancelar
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTask.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 mb-20 text-center">
          <p className="text-sm text-gray-400">
            Tus datos se guardan automáticamente en este dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
