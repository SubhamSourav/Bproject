const { json } = require("express");

class whereClause{

    constructor(base,bigQ){
        this.base = base;
        this.bigQ = bigQ
    }

    search(){
        const searchword = this.bigQ.search ?{
            name:{
                $regex: this.bigQ.search,
                $option: 'i'
            }
        }:{};

        this.base = this.base.find({...searchword})
        return this;
    }

    filter(){
        const copyQ = {...this.bigQ}

        delete copyQ["search"]
        delete copyQ["page"]
        delete copyQ["limit"]

        //convert bigQ into string => copyQ
        let stringofcopyQ = JSON.stringify(copyQ)

        stringofcopyQ = stringofcopyQ.replace(/\b(gte|lte|gt|lt)\b/g,m=> `$${m}`)

        const jsonofcopyQ = JSON.parse(stringofcopyQ)

        this.base = this.base.find(jsonofcopyQ)
        return this;
    }

    pager(resultperPage){
        let currentpage = 1;
        if(this.bigQ.page){
            currentpage = this.bigQ.page
        }

        const skipVal = resultperPage * (currentpage-1)

        this.base =  this.base.limit(resultperPage).skip(skipVal)
        return this;
    }
}

module.exports = whereClause