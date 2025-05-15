$(document).ready(function () {
  const themeBtn = $(".theme-switcher");
  const addTaskBtn = $(".add-task__btn");
  const addTaskInput = $(".add-task__input");
  const tasks = $(".tasks");
  const tasksIsEmpty = $(".tasks__is-empty");
  const tasksManage = $(".tasks__manage");
  const tasksRemainedCount = $(".tasks__remained-count");
  const tasksFilter = $(".tasks__filter");
  const tasksRemoveChecked = $(".tasks__remove-checked");
  let tasksArray = [];

  if (localStorage.theme == "dark") {
    $(":root").addClass("dark");
    $(".theme-switcher > .theme-icon").toggle();
  }

  if (localStorage.tasks && localStorage.tasks !== "[]") {
    tasksArray = JSON.parse(localStorage.getItem("tasks"));
    hideTasksIsEmpty();
    for (let task of tasksArray) {
      makeTaskElement(task);
    }
    handleRemainedTasks();
  }

  // Events

  themeBtn.click(function () {
    $(":root").toggleClass("dark");
    $(":root").hasClass("dark")
      ? (localStorage.theme = "dark")
      : (localStorage.theme = "light");
    $(".theme-switcher > .theme-icon").toggle();
  });

  addTaskBtn.click(function () {
    let inputValue = addTaskInput.val().trim();
    if (inputValue) {
      tasksArray.push({ value: inputValue, isCompleted: false });
      localStorage.setItem("tasks", JSON.stringify(tasksArray));
      addTaskInput.val("");
      makeTaskElement({ value: inputValue, isCompleted: false });
      handleRemainedTasks();
      tasksArray.length == 1 && hideTasksIsEmpty();
    }
  });

  addTaskInput.keypress(function (e) {
    if (e.key == "Enter") {
      addTaskBtn.trigger("click");
    }
  });

  tasksFilter.click(function (e) {
    let target = $(e.target);

    let activeTasks = $(".task__checkbox:not(:checked)").parents(".task");
    let checkedTasks = $(".task__checkbox:checked").parents(".task");

    if (target.hasClass("tasks__all")) {
      $(".task.hide").removeClass("hide");
    } else if (target.hasClass("tasks__active")) {
      activeTasks.removeClass("hide");
      checkedTasks.addClass("hide");
    } else if (target.hasClass("tasks__checked")) {
      activeTasks.addClass("hide");
      checkedTasks.removeClass("hide");
    }

    $(".tasks__filter .active").removeClass("active");
    target.addClass("active");
  });

  tasksRemoveChecked.click(function () {
    targetTasks = $(".task__checkbox:checked").parents(".task");
    if(targetTasks.length) {
      let targetIndexes = [];

      targetTasks.addClass("remove");

      setTimeout(() => {
        targetTasks.remove();
        handleRemainedTasks();
        !tasks.children().length && showTasksIsEmpty();
      }, 500);

      targetTasks.each(function () {
        targetIndexes.push($(this).index());
      });

      for (let index of targetIndexes) {
        tasksArray.splice(index, 1);
      }
      localStorage.setItem("tasks", JSON.stringify(tasksArray));
    }
  });

  // Functions

  function createSvgElement(tag, attrs = {}) {
    const svgNS = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(svgNS, tag);
    for (let attr in attrs) {
      element.setAttribute(attr, attrs[attr]);
    }
    return element;
  }

  function makeTaskElement(task) {
    let taskElement = $("<li>", {
      class: "task transition-all",
      draggable: true,
    });

    let taskContent = $('<div class="task__content transition-all"></div>');
    let taskCheckbox = $("<input>", {
      class: "task__checkbox",
      type: "checkbox",
    });
    let taskText = $('<div class="task__text transition-all"></div>');
    let taskRemove = $('<div class="task__remove transition-all"></div>');
    let taskRemoveIcon = createSvgElement("svg", {
      class: "task__remove-icon",
      fill: "none",
      viewBox: "0 0 24 24",
      "stroke-width": "1.5",
      stroke: "currentColor",
    });
    let path = createSvgElement("path", {
      "stroke-linecamp": "round",
      "stroke-linejoin": "round",
      d: "M6 18 18 6M6 6l12 12",
    });
    taskRemoveIcon.appendChild(path);
    let $taskRemoveIcon = $(taskRemoveIcon);

    taskElement.append(taskContent);
    taskElement.append(taskRemove);
    taskContent.append(taskCheckbox);
    taskContent.append(taskText);
    taskRemove.append($taskRemoveIcon);
    tasks.append(taskElement);

    taskText.text(task.value);
    task.isCompleted && taskCheckbox.prop("checked", true);

    // Events

    taskElement.on("dragstart", function () {
      $(this).addClass("dragging");
    });

    taskElement.on("dragend", function () {
      $(this).removeClass("dragging");
    });

    taskElement.on("dragover", function (e) {
      e.preventDefault();
    });

    taskElement.on("drop", function (e) {
      e.preventDefault();
      if (!$(this).hasClass("dragging")) {
        let targetElement = $(this);
        let dragPosition = $(".dragging").index();
        let dropPosition = targetElement.index();
        if (dropPosition > dragPosition) {
          $(".dragging").insertAfter(targetElement);
        } else {
          $(".dragging").insertBefore(targetElement);
        }

        let draggedItem = tasksArray.splice(dragPosition, 1);
        tasksArray.splice(dropPosition, 0, draggedItem[0]);
        localStorage.setItem("tasks", JSON.stringify(tasksArray));
      }
    });

    taskRemove.click(function () {
      let targetTask = $(this).parent();
      let targetTaskIndex = $(this).parent().index();
      targetTask.addClass("remove");
      setTimeout(() => {
        targetTask.remove();
        handleRemainedTasks();
        !tasks.children().length && showTasksIsEmpty();
      }, 500);

      tasksArray.splice(targetTaskIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasksArray));
    });

    taskCheckbox.change(function (e) {
      let taskIndex = $(this).parents(".task").index();

      tasksArray[taskIndex].isCompleted = e.target.checked;
      localStorage.setItem("tasks", JSON.stringify(tasksArray));

      handleRemainedTasks();
    });
  }

  function hideTasksIsEmpty() {
    tasksManage.css("display", "flex");
    tasksIsEmpty.hide();
  }

  function showTasksIsEmpty() {
    tasksManage.css("display", "none");
    tasksIsEmpty.show();
  }

  function handleRemainedTasks() {
    let checkboxes = $(".task__checkbox:not(:checked)");
    tasksRemainedCount.text(checkboxes.length);
  }
});
