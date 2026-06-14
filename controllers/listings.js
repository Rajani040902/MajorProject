const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.filterCategory = async (req, res) => {
    let { category } = req.params;

    const allListings = await Listing.find({ category });
     if (allListings.length === 0) {
        req.flash("error", `No listings found in ${category}!`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.searchListings = async (req, res) => {     //search route
    let { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } }
        ]
    });

       if (allListings.length === 0) {
        req.flash("error", "No listings found!");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({               //nested populate for author to use in review
       path: "reviews",
       populate: {
        path: "author",
       },
    })
    .populate("owner");
    if(!listing) {
         req.flash("error", "Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res) => {
   
    let data = req.body.listing;
    // 🔥 Fix empty image (form + Hoppscotch)
    if (!data.image || !data.image.url || data.image.url.trim() === "") {
        delete data.image; // ✅ triggers schema default
    };

    let url = req.file.path;
    let filename = req.file.filename;

    console.log(req.body.listing);
  
    const newListing = new Listing(data);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
     let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
         req.flash("error", "Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
let originalImageUrl = listing.image.url;

if (originalImageUrl.includes("cloudinary.com")) {
    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/w_250,h_250,c_fill"
    );
}
    res.render("listings/edit.ejs", { listing,  originalImageUrl});
};

 module.exports.updateListing = async (req, res) => {

    let { id } = req.params;
    let data = req.body.listing;

    let existingListing = await Listing.findById(id);

    // 🔥 Fix image issue
    if (!data.image || !data.image.url || data.image.url.trim() === "") {
        data.image = existingListing.image; // ✅ keep old image
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...data });
   
   if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
   }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};
module.exports.destroyListing = async(req, res) => {
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success", "Listing Deleted!");
     res.redirect("/listings");
    };