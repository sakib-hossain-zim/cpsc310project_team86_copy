var departments = [];
var sections = [];
var instructors = [];

var Carray = [];
var Sarray = [];
var Iarray = [];

for (var i = 0, Carray = coursesArray; i < Carray.length; i++) {
  var obj_1 = Carray[i];
  if (!departments.includes(obj_1.courses_dept)) {
    departments.push(obj_1.courses_dept);
  }
}
departments.push("all departments");

for (var j = 0, Sarray = coursesArray; j < Sarray.length; j++) {
  var obj_2 = Sarray[j];
  if (!sections.includes(obj_2.courses_id)) {
    sections.push(obj_2.courses_id);
  }
}
sections.push("all sections");
for (var k = 0, Iarray = coursesArray; k < Iarray.length; k++) {
  var obj_3 = Iarray[k];
  if (!instructors.includes(obj_3.courses_instructor)) {
    instructors.push(obj_3.courses_instructor);
  }
}
instructors.push("all instructors");
$( document ).ready(function() {

  $('#departmentInput').autocomplete({
    source: departments,
    autoFocus: true,

  });

  $('#sectionInput').autocomplete({
    source: sections,
    autoFocus: true,
  });

  $('#instructorInput').autocomplete({
    source: instructors,
    autoFocus: true,
  });
});
