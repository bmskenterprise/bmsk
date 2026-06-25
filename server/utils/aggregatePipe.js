export const aggregatePipeSubAdmin = (filter,adminId,skip,limit) =>{
  let user
  if(filter.user) {
    user=filter.user
    delete filter.user
  }
  return [{$match:filter},
      {
        $lookup: {
          from: 'users',
          let: {uid:'$user'},
          pipeline: [{$match:{$expr:{$eq:['$_id',{$toObjectId:'$$uid'}]}}},{$project:{_id:1,username:1,adminRef:1}}],
          as: 'user'
        }
      },
      {$unwind: '$user'},
      {$match:{'user.adminRef':adminId,...(user && {'user.username':user})}},
      {$sort:{updatedAt:-1}},
      {
        $facet: {
          metadata: [{$count:'total'}],
          data: [
            {$skip: skip},
            {$limit: limit},
            {$project: {__v:0}}
          ]
        }
      }
  ]
}
export const aggregatePipeSuperAdmin = (filter,skip,limit) =>{
  let user
  if(filter.user) {
    user=filter.user
    delete filter.user
  }
  return [{$match:filter},
      {
        $lookup: {
          from: 'users',
          let: {uid:'$user'},
          pipeline: [{$match:{$expr:{$eq:['$_id',{$toObjectId:'$$uid'}]}}},{$project:{_id:1,username:1}}],
          as: 'user'
        }
      },
      {$unwind:'$user'},
      {$match:{...(user && {'user.username':user})}},
      {$sort:{updatedAt:-1}},
      {
        $facet: {
          metadata: [{$count:'total'}],
          data: [
            {$skip: skip},
            {$limit: limit},
            {$project: {__v:0}}
          ]
        }
      }
  ]
}
