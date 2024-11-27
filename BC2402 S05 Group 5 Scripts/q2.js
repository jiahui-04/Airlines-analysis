// Q2
// [customer_suppport] For each category, display the number of records that contained
// colloquial variation and offensive language.


// To run qns 1 before running qns 2 as qns 2 uses the new collection generated from qns 1
// delete those rows without the right flag format using cleanedCategoryTable
db.cleanedCategoryCollection.deleteMany({
  flags: { $regex: /^[A-Z\s]+$/ }
})

db.cleanedCategoryCollection.aggregate([
  // Match documents where the 'flags' field contains both 'Q' and 'W'
  { 
    $match: {
      $or: [
        { flags: { $regex: /Q/ } },  // Flags must contain 'Q'
        { flags: { $regex: /W/ } }   // Flags must also contain 'W'
      ]
    }
  },
  // Group by the 'cleanedCategory' field and count the number of records in each group
  {
    $group: {
      _id: "$cleanedCategory",   // Group by cleanedCategory
      numOfRecords: { $sum: 1 }  // Count the number of records in each category
    }
  },
  // Project the final output structure
  {
    $project: {
      _id: 0,              // Remove the '_id' field
      cleanedCategory: "$_id",  // Rename the '_id' field to 'cleanedCategory'
      numOfRecords: 1      // Include the numOfRecords field
    }
  }
])
