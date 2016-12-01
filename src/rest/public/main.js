$(function () {

    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        var zip = $("#datasetZip").prop('files')[0];
        var data = new FormData();
        data.append("zip", zip);
        $.ajax("/dataset/" + id,
            {
                type: "PUT",
                data: data,
                processData: false
            }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });


    $("#datasetRm").click(function () {
        var id = $("#datasetId").val();
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });


    $("#queryForm").submit(function (e) {
        e.preventDefault();
        var query;
        if ($("#sectionInput").val().length == 0 && $('#instructorInput').val().length == 0 && $('#departmentInput').val().length !== 0) {
            if ($('#departmentInput').val() == 'all departments') {
                query = JSON.stringify({
                    "GET": ["courses_dept"],
                    "WHERE": {},
                    "ORDER" : "courses_dept",
                    "AS": "TABLE"
                })
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept"],
                        "WHERE": {
                            "IS": {
                                "courses_dept": $('#departmentInput').val()
                            }
                        },
                        "ORDER": "courses_dept",
                        "AS": "TABLE"
                    });
            }

        } else if ($("#sectionInput").val().length !== 0 && $('#instructorInput').val().length == 0 && $('#departmentInput').val().length == 0) {
            if ($("#sectionInput").val() == "all sections") {
                query = JSON.stringify({
                    "GET": ["courses_id"],
                    "WHERE": {},
                    "ORDER" : "courses_id",
                    "AS": "TABLE"
                })
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_id"],
                        "WHERE": {
                            "IS": {
                                "courses_id": $('#sectionInput').val()
                            }
                        },
                        "ORDER": "courses_id",
                        "AS": "TABLE"
                    });
            }
        } else if ($("#sectionInput").val().length == 0 && $('#instructorInput').val().length !== 0 && $('#departmentInput').val().length == 0) {
            if ($("#instructorInput").val() == "all instructors") {
                query = JSON.stringify({
                    "GET": ["courses_instructor"],
                    "WHERE": {},
                    "ORDER" : "courses_instructor",
                    "AS": "TABLE"
                })
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_instructor"],
                        "WHERE": {
                            "IS": {
                                "courses_instructor": $('#instructorInput').val()
                            }
                        },
                        "ORDER": "courses_instructor",
                        "AS": "TABLE"
                    });
            }
        } else if ($("#sectionInput").val().length !== 0 && $('#instructorInput').val().length !== 0 && $('#departmentInput').val().length == 0) {
            if ($("#sectionInput").val() == "all sections" && $("#instructorInput").val() == "all instructors") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_id","courses_instructor"],
                        "WHERE": {},
                        "ORDER": { "dir": "UP", "keys": ["courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#sectionInput").val() == "all sections" && $("#instructorInput").val().length !== 0) {
                query = JSON.stringify(
                    {
                        "GET": ["courses_instructor","courses_id"],
                        "WHERE": {
                            "IS": {
                                "courses_instructor": $('#instructorInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_instructor", "courses_id"]},
                        "AS": "TABLE"
                    });
            } else if ($("#sectionInput").val().length !== 0 && $("#instructorInput").val() == "all instructors") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_instructor", "courses_id"],
                        "WHERE": {
                            "IS": {
                                "courses_id": $('#sectionInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_instructor", "courses_id"]},
                        "AS": "TABLE"
                    });
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_instructor", "courses_id"],
                        "WHERE": {
                            "AND": [
                                {"EQ": {"courses_id": $("#sectionInput").val()}},
                                {"IS": {"courses_instructor": $("#instructorInput").val()}}
                            ]
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_instructor", "courses_id"]},
                        "AS": "TABLE"
                    })
            }

        } else if ($("#sectionInput").val().length !== 0 && $('#instructorInput').val().length == 0 && $('#departmentInput').val().length !== 0) {
            if ($("#sectionInput").val() == "all sections" && $("#departmentInputInput").val() == "all departments") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept","courses_id"],
                        "WHERE": {},
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
                        "AS": "TABLE"
                    });
            } else if ($("#sectionInput").val() == "all sections" && $("#departmentInput").val().length !== 0) {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept","courses_id"],
                        "WHERE": {
                            "IS": {
                                "courses_dept": $('#departmentInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
                        "AS": "TABLE"
                    });
            } else if ($("#sectionInput").val().length !== 0 && $("#departmentInput").val() == "all departments") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id"],
                        "WHERE": {
                            "IS": {
                                "courses_id": $('#sectionInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
                        "AS": "TABLE"
                    });
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id"],
                        "WHERE": {
                            "AND": [
                                {"EQ": {"courses_id": $("#sectionInput").val()}},
                                {"IS": {"courses_dept": $('#departmentInput').val()}}
                            ]
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
                        "AS": "TABLE"
                    })
            }
        } else if ($("#sectionInput").val().length == 0 && $('#instructorInput').val().length !== 0 && $('#departmentInput').val().length !== 0) {
            if ($("#instructorInput").val() == "all instructors" && $("#departmentInput").val() == "all departments") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept","courses_instructor"],
                        "WHERE": {},
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#instructorInput").val() == "all instructors" && $("#departmentInput").val().length !== 0) {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept","courses_instructor"],
                        "WHERE": {
                            "IS": {
                                "courses_dept": $('#departmentInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#instructorInput").val().length !== 0 && $("#departmentInput").val() == "all departments") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_instructor"],
                        "WHERE": {
                            "IS": {
                                "courses_instructor": $('#instructorInput').val()
                            }
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_instructor"],
                        "WHERE": {
                            "AND": [
                                {"IS": {"courses_instructor": $("#instructorInput").val()}},
                                {"IS": {"courses_dept": $('#departmentInput').val()}}
                            ]
                        },
                        "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_instructor"]},
                        "AS": "TABLE"
                    })
            }
        } else if ($("#sectionInput").val().length !== 0 && $('#instructorInput').val().length !== 0 && $('#departmentInput').val().length !== 0) {
            if ($("#instructorInput").val() == "all instructors" && $("#departmentInput").val() == "all departments" && $("#sectionInput").val() == "all sections") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": {},
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#instructorInput").val() == "all instructors" && $("#departmentInput").val() == "all departments") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": {
                            "EQ": {
                                "courses_id": $('#sectionInput').val()
                            }
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#instructorInput").val() == "all instructors" && $("#sectionInput").val() == "all sections") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": {
                            "IS": {
                                "courses_dept": $('#departmentInput').val()
                            }
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            }  else if ($("#departmentInput").val() == "all departments" && $("#sectionInput").val() == "all sections") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": {
                            "IS": {
                                "courses_dept": $('#instructorInput').val()
                            }
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            }else if ($("#instructorInput").val() == "all instructors") {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": { "AND": [
                            {"EQ": {"courses_id": $('#sectionInput').val()}},
                            {"IS": {
                                "courses_dept": $('#departmentInput').val()}}
                        ]
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    });
            } else if ($("#sectionInput").val() == "all sections") {
                query = JSON.stringify({
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": { "AND": [
                            {"IS": {"courses_instructor": $('#instructorInput').val()}},
                            {"IS": {
                                "courses_dept": $('#departmentInput').val()}}
                        ]
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    }
                );
            }  else if ($("#departmentInput").val() == "all departments") {
                query = JSON.stringify({
                    "GET": ["courses_dept", "courses_id", "courses_instructor"],
                    "WHERE": { "AND": [
                        {"IS": {"courses_instructor": $('#instructorInput').val()}},
                        {"EQ": {
                            "courses_id": $('#sectionInput').val()}}
                    ]
                    },
                    "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                    "AS": "TABLE"
                });
            } else {
                query = JSON.stringify(
                    {
                        "GET": ["courses_dept", "courses_id", "courses_instructor"],
                        "WHERE": {
                            "AND": [
                                {"AND": [
                                    {"IS": {"courses_instructor": $('#instructorInput').val()}},
                                    {"IS": {"courses_dept": $("#departmentInput").val()}}
                                ]},
                                {"EQ": {"courses_id": $("#sectionInput").val()}}
                            ]
                        },
                        "ORDER": {"dir": "UP", "keys": ["courses_dept", "courses_id", "courses_instructor"]},
                        "AS": "TABLE"
                    })
            }
        }
        alert(query);

        try {
            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title,
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").style("margin", "auto");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }
});