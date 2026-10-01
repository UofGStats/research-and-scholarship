# Export the Funding Finder workbook to the JSON file used by the website.

required_packages <- c("readxl", "jsonlite")
missing_packages <- required_packages[
  !vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)
]

if (length(missing_packages) > 0) {
  stop(
    "Install the required packages in the RStudio Console with: install.packages(c(\"readxl\", \"jsonlite\"))"
  )
}

workbook_path <- "Funding_Finder_for_Statistics_FFS.xlsx"
output_path <- file.path("data", "funding-opportunities.json")

clean <- function(value) {
  value <- as.character(value)
  value[is.na(value)] <- ""
  trimws(value)
}

slugify <- function(value) {
  value <- iconv(tolower(clean(value)), to = "ASCII//TRANSLIT")
  value <- gsub("[^a-z0-9]+", "-", value)
  value <- gsub("^-|-$", "", value)
  substr(value, 1, 80)
}

deadline_fields <- function(value) {
  text <- clean(value)

  if (grepl("^[0-9]+(?:\\.0+)?$", text, perl = TRUE)) {
    date <- as.Date(as.numeric(text), origin = "1899-12-30")
    return(list(
      display = format(date, "%e %b %Y") |> trimws(),
      sort_key = format(date, "%Y-%m-%d"),
      kind = "exact",
      note = "",
      date = date
    ))
  }

  if (tolower(text) == "no closing date") {
    return(list(
      display = text,
      sort_key = "9999-12-31",
      kind = "rolling",
      note = "Rolling",
      date = as.Date(NA)
    ))
  }

  month_date <- suppressWarnings(as.Date(paste("1", text), format = "%d %b %Y"))
  if (!is.na(month_date)) {
    return(list(
      display = text,
      sort_key = format(month_date, "%Y-%m-%d"),
      kind = "month",
      note = "Expected",
      date = month_date
    ))
  }

  list(
    display = text,
    sort_key = "9999-12-31",
    kind = "text",
    note = "",
    date = as.Date(NA)
  )
}

funding_data <- readxl::read_excel(
  workbook_path,
  sheet = "Funding opportunities",
  col_types = "text"
)
guide <- readxl::read_excel(
  workbook_path,
  sheet = "Guide & sources",
  col_names = FALSE,
  col_types = "text",
  .name_repair = "minimal"
)

last_reviewed_row <- which(clean(guide[[1]]) == "Last reviewed")
if (length(last_reviewed_row) != 1) {
  stop("Could not find a unique Last reviewed entry in the Guide & sources worksheet.")
}
last_reviewed <- clean(guide[[2]][last_reviewed_row])

records <- lapply(seq_len(nrow(funding_data)), function(index) {
  row <- funding_data[index, ]
  deadline <- deadline_fields(row[["Deadline"]])
  status <- clean(row[["Status setting"]])

  if (deadline$kind == "exact" && deadline$date < Sys.Date()) {
    status <- "DEADLINE PASSED"
  }

  list(
    id = paste0(slugify(row[["Opportunity"]]), "-", index),
    status = status,
    deadline_display = deadline$display,
    deadline_sort = deadline$sort_key,
    deadline_kind = deadline$kind,
    deadline_note = deadline$note,
    funder = clean(row[["Funder"]]),
    opportunity = clean(row[["Opportunity"]]),
    type = clean(row[["Type"]]),
    area = clean(row[["Research / Scholarship"]]),
    funding_duration = clean(row[["Funding / duration"]]),
    eligibility = clean(row[["Who can apply / key restriction"]]),
    statistics_relevance = clean(row[["Why relevant to Statistics"]]),
    theme_tags = clean(row[["Theme tags"]]),
    internal_note = clean(row[["Internal action / note"]]),
    source = clean(row[["Source"]])
  )
})

record_order <- order(
  vapply(records, `[[`, character(1), "deadline_sort"),
  vapply(records, `[[`, character(1), "opportunity"),
  method = "radix"
)
records <- records[record_order]

dir.create(dirname(output_path), recursive = TRUE, showWarnings = FALSE)
jsonlite::write_json(
  list(last_reviewed = last_reviewed, opportunities = records),
  output_path,
  pretty = TRUE,
  auto_unbox = TRUE,
  na = "null"
)
cat(sprintf("Exported %d opportunities to %s\n", length(records), output_path))
