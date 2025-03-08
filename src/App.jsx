import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, addDays, subDays } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {  AnimatePresence , motion } from 'framer-motion';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('calendarTasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
  }, [tasks]);

  const getDaysInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start);
    const endDay = getDay(end);

    const prevMonthDays = Array.from({ length: startDay }, (_, i) => subDays(start, startDay - i));
    const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => addDays(end, i + 1));

    return [...prevMonthDays.reverse(), ...days, ...nextMonthDays];
  };

  const daysInMonth = getDaysInMonth(currentDate);

  const openModal = (date, task = null) => {
    setSelectedDate(date);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (title, description, color) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newTask = { title, description, color };
    
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      if (!updatedTasks[dateKey]) {
        updatedTasks[dateKey] = [];
      }
      if (selectedTask) {
        const taskIndex = updatedTasks[dateKey].findIndex(t => t === selectedTask);
        if (taskIndex !== -1) {
          updatedTasks[dateKey][taskIndex] = newTask;
        }
      } else {
        updatedTasks[dateKey] = [...(updatedTasks[dateKey] || []), newTask];
      }
      return updatedTasks;
    });

    closeModal();
  };

  const handleDeleteTask = () => {
    if (selectedTask && selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setTasks(prevTasks => {
        const updatedTasks = { ...prevTasks };
        updatedTasks[dateKey] = updatedTasks[dateKey].filter(t => t !== selectedTask);
        return updatedTasks;
      });
    }
    closeModal();
  };

  const DayCell = ({ date, tasks, onDayClick, onTaskClick, isToday }) => {
    const isCurrentMonth = isSameMonth(date, currentDate);
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`p-2 rounded-lg shadow-md ${
          isCurrentMonth ? 'bg-white' : 'bg-gray-100'
        } ${
          isToday ? 'ring-2 ring-blue-500' : ''
        } min-h-[120px] cursor-pointer transition-all duration-200 hover:shadow-lg`}
        onClick={onDayClick}
      >
        <div className={`font-semibold text-right ${isToday ? 'text-blue-500' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
          {format(date, 'd')}
        </div>
        <div className="mt-2 space-y-1">
          {tasks.slice(0, 3).map((task, index) => (
            <Task key={index} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </motion.div>
    );
  };

  const Task = ({ task, onClick }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`text-xs p-1 rounded truncate cursor-pointer font-medium ${
          task.color === 'blue' ? 'bg-blue-700 text-white' :
          task.color === 'green' ? 'bg-green-700 text-white' :
          'bg-red-700 text-white'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(task);
        }}
      >
        {task.title}
      </motion.div>
    );
  };

  const TaskModal = () => {
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState(selectedTask ? selectedTask.color : 'blue');

    if (!isModalOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveTask(
        titleRef.current.value,
        descriptionRef.current.value,
        selectedColor
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={closeModal}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md p-6 rounded-lg shadow-xl bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4">{selectedTask ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  ref={titleRef}
                  defaultValue={selectedTask ? selectedTask.title : ''}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  ref={descriptionRef}
                  defaultValue={selectedTask ? selectedTask.description : ''}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex space-x-2">
                  {['blue', 'green', 'red'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        color === 'blue' ? 'bg-blue-600' :
                        color === 'green' ? 'bg-green-600' : 'bg-red-600'
                      } ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              {selectedTask && (
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  <FaTrash className="inline-block mr-2" /> Delete
                </button>
              )}
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  {selectedTask ? <><FaEdit className="inline-block mr-2" /> Update</> : <><FaPlus className="inline-block mr-2" /> Add</>}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 font-sans">
      <div className="container mx-auto p-4" style={{ width: '70%' }}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentDate(prevDate => subMonths(prevDate, 1))}
              className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <FaChevronLeft className="text-2xl text-blue-600" />
            </button>
            <h1 className="text-4xl font-bold mx-4 text-blue-800">{format(currentDate, 'MMMM')}</h1>
            <button
              onClick={() => setCurrentDate(prevDate => addMonths(prevDate, 1))}
              className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <FaChevronRight className="text-2xl text-blue-600" />
            </button>
          </div>
          <h2 className="text-3xl font-semibold text-purple-800">{format(currentDate, 'yyyy')}</h2>
        </div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md"
          >
            Today
          </button>
          <button
            onClick={() => openModal(new Date())}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md"
          >
            <FaPlus className="mr-2" /> Create Task
          </button>
        </div>
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-lg text-purple-700">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4">
          {daysInMonth.map((date) => (
            <DayCell
              key={date.toString()}
              date={date}
              tasks={tasks[format(date, 'yyyy-MM-dd')] || []}
              onDayClick={() => openModal(date)}
              onTaskClick={(task) => openModal(date, task)}
              isToday={isSameDay(date, new Date())}
            />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && <TaskModal />}
      </AnimatePresence>
    </div>
  );
};

export default App;

