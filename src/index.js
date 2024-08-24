import express from "express";
import { v4 as uuid } from "uuid";
import moment from "moment";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

const receipts = [];
const requiredFields = [
  "retailer",
  "purchaseDate",
  "purchaseTime",
  "items",
  "total",
];
const requiredItemFields = ["shortDescription", "price"];

app.post("/receipts/process", (req, res) => {
  const { retailer, purchaseDate, purchaseTime, items, total } = req.body;

  const totalNumber = parseFloat(total);

  const hasAllFields = requiredFields.every((field) => req.body[field]);

  if (
    !hasAllFields ||
    typeof retailer !== "string" ||
    !moment(purchaseDate, "YYYY-MM-DD", true).isValid() ||
    !moment(purchaseTime, "HH:mm", true).isValid() ||
    isNaN(totalNumber) ||
    totalNumber <= 0
  ) {
    return res.status(400).send("The receipt is invalid");
  }

  const hasAllItemFields = items.every((item) => {
    return requiredItemFields.every((field) => item[field]);
  });

  const invalidItems = items.filter(
    (item) =>
      typeof item.shortDescription !== "string" ||
      isNaN(parseFloat(item.price)) ||
      parseFloat(item.price) <= 0
  );

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !hasAllItemFields ||
    invalidItems.length > 0
  ) {
    return res.status(400).send("The receipt is invalid");
  }

  const newReceipt = {
    id: uuid(),
    ...req.body,
  };

  receipts.push(newReceipt);

  res.send({
    id: newReceipt.id,
  });
});

app.get("/receipts/:id/points", (req, res) => {
  const receiptId = req.params.id;

  const receipt = receipts.find((receipt) => receipt.id === receiptId);

  if (!receipt) {
    return res.status(404).send("No receipt found for that id");
  }

  let points = 0;

  // One point for every alphanumeric character in the retailer name.
  points += receipt.retailer.replace(/[^a-zA-Z0-9]/g, "").length;

  const total = parseFloat(receipt.total);

  // 50 points if the total is a round dollar amount with no cents.
  if (Number.isInteger(total)) {
    points += 50;
  }

  // 25 points if the total is a multiple of 0.25.
  if (total % 0.25 === 0) {
    points += 25;
  }

  // 5 points for every two items on the receipt.
  points += Math.floor(receipt.items.length / 2) * 5;

  // If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
  receipt.items.forEach((item) => {
    const trimmedLength = item.shortDescription.trim().length;

    if (trimmedLength % 3 === 0) {
      points += Math.ceil(parseFloat(item.price) * 0.2);
    }
  });

  // 6 points if the day in the purchase date is odd.
  const purchaseDate = moment(receipt.purchaseDate);
  if (purchaseDate.date() % 2 !== 0) {
    points += 6;
  }

  // 10 points if the time of purchase is after 2:00pm and before 4:00pm.
  const purchaseTime = moment(receipt.purchaseTime, "HH:mm");
  const after2pm = moment("14:00", "HH:mm");
  const before4pm = moment("16:00", "HH:mm");

  if (purchaseTime.isAfter(after2pm) && purchaseTime.isBefore(before4pm)) {
    points += 10;
  }

  res.send({
    points,
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
