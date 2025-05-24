"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Briefcase, Clock, DollarSign, Target, FileText, Tag, Edit, Trash2, Save, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LeadDetailsDialog({ isOpen, onClose, lead, onUpdate, onDelete, users, canEdit, canDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [formData, setFormData] = useState({ ...lead })
  const [tagInput, setTagInput] = useState("")

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()],
        }))
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const handleSave = () => {
    // Find the assigned user's name and avatar
    const assignedUser = users.find((user) => user.id === formData.assignedToId)

    onUpdate({
      ...formData,
      assignedTo: assignedUser?.name || "Unassigned",
      assignedToAvatar: assignedUser?.avatar,
    })

    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(lead.id)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {status}
          </Badge>
        )
      case "Contacted":
        return (
          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
            {status}
          </Badge>
        )
      case "Qualified":
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
            {status}
          </Badge>
        )
      case "Proposal":
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            {status}
          </Badge>
        )
      case "Negotiation":
        return (
          <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
            {status}
          </Badge>
        )
      case "Converted":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            {status}
          </Badge>
        )
      case "Dropped":
        return (
          <Badge variant="default" className="bg-red-500 hover:bg-red-600">
            {status}
          </Badge>
        )
    }
  }

  // Get priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Low":
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-300">
            {priority}
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-300">
            {priority}
          </Badge>
        )
      case "High":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-300">
            {priority}
          </Badge>
        )
      case "Urgent":
        return (
          <Badge variant="outline" className="text-red-500 border-red-300">
            {priority}
          </Badge>
        )
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Lead Details</DialogTitle>
              <div className="flex items-center gap-2">
                {canEdit && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}

                {isEditing && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...lead })
                        setIsEditing(false)
                      }}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>

                    <Button variant="default" size="sm" onClick={handleSave} className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </>
                )}

                {canDelete && !isEditing && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 space-y-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <Avatar className="h-20 w-20 mb-2">
                      <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="text-center font-semibold"
                      />
                    ) : (
                      <h2 className="text-xl font-semibold text-center">{formData.name}</h2>
                    )}

                    {formData.company && !isEditing && (
                      <p className="text-sm text-muted-foreground text-center">{formData.company}</p>
                    )}

                    {isEditing && (
                      <Input
                        name="company"
                        value={formData.company || ""}
                        onChange={handleChange}
                        placeholder="Company"
                        className="text-center mt-2"
                      />
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      {getStatusBadge(formData.status)}
                      {getPriorityBadge(formData.priority)}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Contact Information</h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input name="email" value={formData.email} onChange={handleChange} type="email" />
                        ) : (
                          <span className="text-sm">{formData.email}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input name="phone" value={formData.phone} onChange={handleChange} />
                        ) : (
                          <span className="text-sm">{formData.phone}</span>
                        )}
                      </div>

                      {(formData.position || isEditing) && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              name="position"
                              value={formData.position || ""}
                              onChange={handleChange}
                              placeholder="Position"
                            />
                          ) : (
                            <span className="text-sm">{formData.position}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Lead Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        {isEditing ? (
                          <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange("status", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Contacted">Contacted</SelectItem>
                              <SelectItem value="Qualified">Qualified</SelectItem>
                              <SelectItem value="Proposal">Proposal</SelectItem>
                              <SelectItem value="Negotiation">Negotiation</SelectItem>
                              <SelectItem value="Converted">Converted</SelectItem>
                              <SelectItem value="Dropped">Dropped</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{getStatusBadge(formData.status)}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Priority</p>
                        {isEditing ? (
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => handleSelectChange("priority", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{getPriorityBadge(formData.priority)}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Source</p>
                        {isEditing ? (
                          <Select
                            value={formData.source}
                            onValueChange={(value) => handleSelectChange("source", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Website">Website</SelectItem>
                              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="Referral">Referral</SelectItem>
                              <SelectItem value="Direct Call">Direct Call</SelectItem>
                              <SelectItem value="Email">Email</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium">{formData.source}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Interest</p>
                        {isEditing ? (
                          <Input name="interest" value={formData.interest} onChange={handleChange} />
                        ) : (
                          <p className="font-medium">{formData.interest}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Assigned To</p>
                        {isEditing ? (
                          <Select
                            value={formData.assignedToId.toString()}
                            onValueChange={(value) => handleSelectChange("assignedToId", Number.parseInt(value, 10))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={formData.assignedToAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{formData.assignedTo.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{formData.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(formData.created)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDate(formData.lastUpdated)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Last Activity</h3>
                    <p className="text-sm">{formData.lastActivity || "No activity recorded"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Budget & Timeline</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    {isEditing ? (
                      <Input
                        id="budget"
                        name="budget"
                        value={formData.budget || ""}
                        onChange={handleChange}
                        placeholder="e.g. $500,000 - $700,000"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.budget || "Not specified"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    {isEditing ? (
                      <Input
                        id="timeline"
                        name="timeline"
                        value={formData.timeline || ""}
                        onChange={handleChange}
                        placeholder="e.g. 3-6 months"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.timeline || "Not specified"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Requirements</h3>

                {isEditing ? (
                  <Textarea
                    name="requirements"
                    value={formData.requirements || ""}
                    onChange={handleChange}
                    placeholder="Specific requirements or preferences"
                    rows={4}
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="whitespace-pre-line">{formData.requirements || "No requirements specified"}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Notes</h3>

                {isEditing ? (
                  <Textarea
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleChange}
                    placeholder="Add notes about this lead"
                    rows={6}
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="whitespace-pre-line">{formData.notes || "No notes added"}</p>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Tags</h3>

                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 rounded-full hover:bg-muted p-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <Input
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex flex-wrap gap-2">
                      {formData.tags && formData.tags.length > 0 ? (
                        formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No tags added</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead "{lead.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
export default LeadDetailsDialog