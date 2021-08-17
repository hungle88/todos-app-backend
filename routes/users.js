var express = require("express");
var router = express.Router();
const { ObjectID } = require("bson");
const uaa = require("../middlewares/uaa");
router.get("/", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .find()
    .toArray(function (err, data) {
      if (err) throw err;

      data.forEach((user) => console.log(user));
      res.json(data);
    });
});

//display todo
router.get("/:id", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      if (req.fname === data.fname) {
        res.json(data);
      } else {
        res.json({ user: "invalid" });
      }
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/:id/todolist", (req, res) => {
  req.db
    .collection("users")
    .find({ _id: new ObjectID(req.params.id) })
    .project({ fname: 1, lname: 1, todos: 1 })
    .toArray(function (err, data) {
      if (err) {
        throw err;
      }
      if (req.fname === data[0].fname) {
        data.forEach((item) => console.log(item));
        console.log(data);
        res.json(data);
      } else {
        res.json({ user: "invalid" });
      }
    });
});

//update todo
router.put("/:id/todolist/:item", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      if (req.fname === data.fname) {
        req.db
          .collection("users")
          .updateOne(
            { "todos.item": new ObjectID(req.params.item) },
            {
              $set: {
                "todos.$.title": req.body.title,
                "todos.$.description": req.body.description,
              },
            }
          )
          .then((data) => {
            res.json({ status: "Updated" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid" });
      }
    })
    .catch((err) => {
      res.json({ status: "error" });
    });
});

//remove todo
router.delete("/:id/todolist/:item", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      if (req.fname === data.fname) {
        req.db
          .collection("users")
          .updateOne(
            {
              "todos.item": new ObjectID(req.params.item),
            },
            {
              $pull: {
                todos: {
                  item: new ObjectID(req.params.item),
                },
              },
            }
          )
          .then((data) => {
            res.json({ status: "Deleted" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid" });
      }
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add todo
router.post("/:id/todolist/", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      if (req.fname === data.fname) {
        let payload = req.body;

        payload.item = ObjectID();
        payload.date = new Date();
        req.db
          .collection("users")
          .updateOne(
            { _id: new ObjectID(req.params.id) },
            {
              $push: {
                todos: payload,
              },
            }
          )
          .then((data) => {
            res.json({ status: "added" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid" });
      }
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add comment

router.put("/:id/todolist/:item/comment", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      let payload = req.body;
      console.log(payload.fname);
      if (req.fname === payload.fname) {
        payload.commentId = ObjectID();
        req.db
          .collection("users")
          .updateOne(
            { "todos.item": new ObjectID(req.params.item) },
            {
              $push: {
                "todos.$.comment": req.body,
              },
            }
          )
          .then((data) => {
            res.json({ status: "comment added" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid username" });
      }
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//edit comment

router.put("/:id/comment/:commentId", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      //getting the index of the comment in the comment array
      for (let i = 0; i < data.todos.length; i++) {
        for (let j = 0; j < data.todos[i].comment.length; j++) {
          if (data.todos[i].comment[j].commentId == req.params.commentId) {
            console.log(data.todos[i].comment[j].content);
            // let commentIndex = `todos.$.comment.${j}.content`;
            if (req.fname !== data.todos[i].comment[j].fname) {
              console.log(req.fname);
              console.log(data.todos[i].comment[j].fname);
              res.json({ user: "invalid" });
            } else {
              let payload = req.body;

              payload.commentId = ObjectID();

              req.db
                .collection("users")
                .updateOne(
                  {
                    "todos.comment.commentId": new ObjectID(
                      req.params.commentId
                    ),
                  },
                  {
                    $push: {
                      "todos.$.comment": req.body,
                    },
                  }
                )
                .then((data) => {
                  req.db
                    .collection("users")
                    .updateOne(
                      {
                        "todos.comment.commentId": new ObjectID(
                          req.params.commentId
                        ),
                      },
                      {
                        $pull: {
                          "todos.$.comment": {
                            commentId: new ObjectID(req.params.commentId),
                          },
                        },
                      }
                    )
                    .then((data) => {
                      res.json({ status: "Comment updated successfully" });
                    })
                    .catch((err) => {
                      res.json({ status: "error" });
                    });
                })
                .catch((err) => {
                  res.json({ status: "error" });
                });
            }
          }
        }
      }
    })
    .catch((err) => {
      res.json({ status: "error" });
    });
});

//delete comment
router.delete("/:id/comment/:commentId", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      for (let i = 0; i < data.todos.length; i++) {
        for (let j = 0; j < data.todos[i].comment.length; j++) {
          if (data.todos[i].comment[j].commentId == req.params.commentId) {
            console.log(data.todos[i].comment[j].content);
            // let commentIndex = `todos.$.comment.${j}.content`;
            if (req.fname !== data.todos[i].comment[j].fname) {
              console.log(req.fname);
              console.log(data.todos[i].comment[j].fname);
              res.json({ user: "invalid" });
            } else {
              req.db
                .collection("users")
                .updateOne(
                  {
                    "todos.comment.commentId": new ObjectID(
                      req.params.commentId
                    ),
                  },
                  {
                    $pull: {
                      "todos.$.comment": {
                        commentId: new ObjectID(req.params.commentId),
                      },
                    },
                  }
                )
                .then((data) => {
                  res.json({ status: "Deleted successfully" });
                })
                .catch((err) => {
                  res.json({ status: "error" });
                });
            }
          }
        }
      }
    })
    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add reaction
//add like

router.put("/:id/todolist/:item/like", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      let reaction = req.body.reaction;
      console.log("test test");
      req.db
        .collection("users")
        .updateOne(
          { "todos.item": new ObjectID(req.params.item) },
          {
            $inc: {
              "todos.$.likes": 1,
            },
          }
        )
        .then((data) => {
          res.json({ status: "like added" });
        })
        .catch((err) => {
          res.json({ status: "error" });
        });
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add dislike

router.put("/:id/todolist/:item/dislike", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      let reaction = req.body.reaction;
      req.db
        .collection("users")
        .updateOne(
          { "todos.item": new ObjectID(req.params.item) },
          {
            $inc: {
              "todos.$.dislikes": 1,
            },
          }
        )
        .then((data) => {
          res.json({ status: "dislike added" });
        })
        .catch((err) => {
          res.json({ status: "error" });
        });
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add status

router.put("/:id/todolist/:item/status", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      if (req.fname === data.fname) {
        let status = req.body.status;
        req.db
          .collection("users")
          .updateOne(
            { "todos.item": new ObjectID(req.params.item) },
            {
              $set: {
                "todos.$.status": status,
              },
            }
          )
          .then((data) => {
            res.json({ status: "status updated" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid username" });
      }
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//add shared users

router.put("/:id/todolist/:item/addviewer", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      console.log(data.fname);
      if (req.fname === data.fname) {
        req.db
          .collection("users")
          .updateOne(
            { "todos.item": new ObjectID(req.params.item) },
            {
              $push: {
                "todos.$.viewers": req.body,
              },
            }
          )
          .then((data) => {
            res.json({ status: "viewer added" });
          })
          .catch((err) => {
            res.json({ status: "error" });
          });
      } else {
        res.json({ user: "invalid username" });
      }
    })

    .catch((err) => {
      res.json({ status: "error" });
    });
});

//display only one todo

// router.get("/:item/onetodo", (req, res) => {
//   req.db
//     .collection("users")
//     .aggregate([
//       { $match: { "todos.item": ObjectID(req.params.item) } },
//       {
//         $project: {
//           todos: {
//             $filter: {
//               input: "$todos",
//               as: "todos",
//               cond: { $eq: ["$$todos.item", ObjectID(req.params.item)] },
//             },
//           },
//         },
//       },
//     ])
//     .toArray(function (err, data) {
//       if (err) throw err;
//       console.log(req.params.item);
//       data.forEach((todo) => console.log(todo));
//       res.json(data);
//     });
// });

//sort by number of like
router.get("/:id/sortbylike", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $sort: { "todos.likes": 1 } },
      { $group: { _id: ObjectID(req.params.id), todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort by number of dislike
router.get("/:id/sortbydislike", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $sort: { "todos.dislikes": 1 } },
      { $group: { _id: ObjectID(req.params.id), todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort by creation date

router.get("/:id/sortbydate", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $sort: { "todos.date": 1 } },
      { $group: { _id: ObjectID(req.params.id), todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(data);
      // console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//filter by status
//filter by complete

router.get("/:id/todolist/complete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "complete" } },
      { $group: { _id: ObjectID(req.params.id), todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//filter by incomplete
router.get("/:id/todolist/incomplete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "incomplete" } },
      { $group: { _id: ObjectID(req.params.id), todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//display all completed todo from everyone

router.get("/todolist/showallcomplete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "complete" } },
      { $group: { _id: "$fname", todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//display all incompleted todo from everyone

router.get("/todolist/showallincomplete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "incomplete" } },
      { $group: { _id: "$fname", todos: { $push: "$todos" } } },
    ])
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort by number of incomplete

router.get("/todolist/sortbynumberincomplete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "incomplete" } },
      {
        $group: {
          _id: "$fname",
          status: { $push: "$todos.status" },
        },
      },
      {
        $project: {
          _id: "$_id",
          numberOfIncomplete: {
            $cond: {
              if: { $isArray: "$status" },
              then: { $size: "$status" },
              else: "NA",
            },
          },
        },
      },
    ])
    .sort({ numberOfIncomplete: -1 })
    .limit(3)
    .toArray(function (err, data) {
      if (err) throw err;
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort by number of complete

router.get("/todolist/sortbynumbercomplete", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },
      { $match: { "todos.status": "complete" } },
      {
        $group: {
          _id: "$fname",
          status: { $push: "$todos.status" },
        },
      },
      {
        $project: {
          _id: "$_id",
          numberOfComplete: {
            $cond: {
              if: { $isArray: "$status" },
              then: { $size: "$status" },
              else: "NA",
            },
          },
        },
      },
    ])
    .sort({ numberOfComplete: -1 })
    .limit(3)
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort by number of comment

router.get("/todolist/sortbynumbercomment", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },

      {
        $project: {
          fname: "$fname",
          lname: "$lname",

          todoTitle: "$todos.title",
          numberOfComment: {
            $cond: {
              if: { $isArray: "$todos.comment" },
              then: { $size: "$todos.comment" },
              else: "NA",
            },
          },
        },
      },
    ])
    .sort({ numberOfComment: -1 })
    .limit(5)
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort todo by number of like

router.get("/todolist/sortbynumberoflike", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },

      {
        $project: {
          fname: "$fname",
          lname: "$lname",

          todoTitle: "$todos.title",
          numberOfLike: "$todos.likes",
        },
      },
    ])
    .sort({ numberOfLike: -1 })
    .limit(3)
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});

//sort todo by number of dislike

router.get("/todolist/sortbynumberofdislike", uaa.isAdmin, (req, res) => {
  req.db
    .collection("users")
    .aggregate([
      { $unwind: "$todos" },

      {
        $project: {
          fname: "$fname",
          lname: "$lname",

          todoTitle: "$todos.title",
          numberOfDisike: "$todos.dislikes",
        },
      },
    ])
    .sort({ numberOfDislikes: -1 })
    .limit(3)
    .toArray(function (err, data) {
      if (err) throw err;
      console.log(req.params.item);
      data.forEach((todo) => console.log(todo));
      res.json(data);
    });
});
//show shared viewer of each todo

router.get("/:id/todolist/sharedviewer", (req, res) => {
  req.db
    .collection("users")
    .findOne({ _id: new ObjectID(req.params.id) })
    .then((data) => {
      console.log(data.fname);
      if (req.fname === data.fname) {
        req.db
          .collection("users")
          .aggregate([
            { $unwind: "$todos" },

            {
              $project: {
                fname: "$fname",
                lname: "$lname",

                todoTitle: "$todos.title",
                sharedViewers: "$todos.viewers",
              },
            },
          ])
          .toArray(function (err, data) {
            if (err) throw err;
            console.log(req.params.item);
            data.forEach((todo) => console.log(todo));
            res.json(data);
          });
      } else {
        res.json({ user: "invalid username" });
      }
    })
    .catch((err) => {
      res.json({ status: "error" });
    });
});

module.exports = router;
