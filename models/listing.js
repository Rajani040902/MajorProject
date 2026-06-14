const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://plus.unsplash.com/premium_photo-1661883982941-50af7720a6ff?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },

    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

   category: {
    type: String,
    default: "Trending"
},

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
});

//POST MONGOOSE MIDDLEWARE---->(TO DELETE ALL REVIEW IF LISTING IS DELETED)
listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing) {
     await Review.deleteMany({_id : {$in: listing.reviews}})
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

