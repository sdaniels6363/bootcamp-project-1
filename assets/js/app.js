var events = [];
var pageNo = 1;
var pageCount;


//Dynamically add filter categories to Filter Dropdown.
$("#filter").empty();
for (x in categories) {
    var newOpt = $("<option>");
    newOpt.val(x)
        .text(categories[x])
    $("#filter").append(newOpt);
}

//On Selection of Filters, hide all rows, then only show rows containing the selected categories.
$("#filter").on("change", function () {
    var categoryFilters = $(this).val();
    if (categoryFilters.length === 0) {
        $("#events").find("tr").show();
        return false;
    } else {
        $("#events").find("tr").hide();
        for (x in categoryFilters) {
            $("#events").find(`tr[data-category='${categoryFilters[x]}']`).show();
        }
    }
});

// api call function 
function eventbriteAPI(destination, startDate, endDate) {

    if (destination) {
        console.log(destination);
    };
    if (startDate) {
        startDate = moment(startDate).format("YYYY-MM-DDThh:mm:ss");
    };
    if (endDate) {
        endDate = moment(endDate).format("YYYY-MM-DDThh:mm:ss");
    }

    var queryURL = `https://cors-anywhere.herokuapp.com/https://www.eventbriteapi.com/v3/events/search?start_date.range_start=${startDate}&start_date.range_end=${endDate}&location.address=${destination}&page=${pageNo}`;

    $.ajax({
        url: queryURL,
        method: "GET",
        beforeSend: function (request) {
            request.withCredentials = true;
            request.setRequestHeader("Authorization", "Bearer QPEWGCGG3AMHB3TDR5S2");
        },
    }).then(function (response) {
        for (i = 0; i < response.events.length; i++) {
            events.push(response.events[i]);
        }
        pageCount = response.pagination.page_count;
        console.log("pass: " + pageNo);
        if (pageCount > 1 && pageCount !== pageNo) {
            for (i = 2; i <= pageCount; i++) {
                pageNo = i;
                eventbriteAPI(destination, startDate, endDate)
            }
        }
    }).then(function () { //Additional Then for after the events array is complete.
        $("#events").empty(); //Empty the Events table.
        for (x in events) { //For each element in events array.
            var data = events[x]; //Set data to current element interval.
            if (data.summary === null) //If event does not have a summary, skip it.
                continue;
            var newTR = $(`<tr data-category='${data.category_id}'>`);
            newTR.append(`<td>${data.name.text}</td>`)
                // .append(`<td>${data.summary}</td>`) //Event Summary, Shorter than the description
                .append(`<td >${(data.category_id === null) ? 'None' : categories[data.category_id]}`)
                .append(`<td>${moment(data.start.local).format("MM/DD/YYYY<br>h:mm a")}</td>`) //Formats date/time
                .append(`<td>${data.is_free ? 'Free!' : 'Not Free!'}</td>`) //Terniary operator, outputs based on is_free boolean.
                .append(`<td><a href='${data.url}'>More Info</a>`); //URL to the eventbrite page.
            $("#events").append(newTR);
        }
    });
}

function skyscannerAPI(from, to, date) {
    var date1 = moment(date).format("YYYY-MM-DD");
    console.log(date1);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" + from + "-sky/" + to + "-sky/" + date1,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
            "x-rapidapi-key": "15873b5e23mshf948e6e3feda7b2p1db4fajsn89e6f75dccf9"
        }
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        for (i = 0; i < response.Carriers.length; i++) {
            if (response.Quotes[0].OutboundLeg.CarrierIds[0] == response.Carriers[i].CarrierId) {
                var row2 = `
                <tr>
                <td>${from}</td>
                <td>${response.Carriers[i].Name}</td>
                <td>${date}</td>
                <td>${response.Quotes[0].MinPrice}</td>
                </tr>
                `
                $(".flight").append(row2);
            }
        }
    });

}

// eventbriteAPI("Charlotte", "2019-09-02", "2019-09-03");

$(document).ready(function () {

    $("#submit").on("click", function (event) {
        event.preventDefault();
        var destination = $("#destination-input").val().trim();
        var origin = $("#origin-input").val().trim();
        var startDate = $("#start-date").val().trim();
        var endDate = $("#end-date").val().trim();
        console.log(`${destination} ${startDate} ${endDate}`);
        $(".flight").empty();

       
        eventbriteAPI(destination, startDate, endDate);
        skyscannerAPI(cityToAirport[origin], cityToAirport[destination], startDate);
        skyscannerAPI(cityToAirport[destination], cityToAirport[origin], endDate);

    });


});




// $(document).ready(function(){
//   for ( i = 0; i < events.length;i++){
//     var event = events[i];
//     var free = event.is_free;
//     var name = event.name;
//     var url = event.url;
//     // var tableEntry = 
//   }
// });


$(document).ready(function () {
    $('select').formSelect();
});

$(document).ready(function () {
    $('input.autocomplete').autocomplete({
        data: {
            "New York": null,
            "Apple": null,
            "Microsoft": null,
            "Google": 'https://placehold.it/250x250'
        },
    });
});

$(document).ready(function () {
    $('.datepicker').datepicker();
});