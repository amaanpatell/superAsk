"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Search, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function ModelSelector({
  models,
  selectedModelId,
  onModelSelect,
  className,
}: any) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<any | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectedModel = models.find((m: any) => m.id === selectedModelId);

  const formatContextLength = (length: number) => {
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  const openModelDetails = (model: any, e: any) => {
    e.stopPropagation();
    setSelectedForDetails(model);
    setDetailsOpen(true);
  };

  const filteredModels = models.filter((model: any) => {
    const query = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query)
    );
  });

  // Group models by provider
  const groupedModels = filteredModels.reduce((acc: any, model: any) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {});

  const providerNames: any = {
    google: "Google Gemini",
    openai: "OpenAI",
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-8 justify-between gap-2 px-2 text-xs hover:bg-accent",
              className
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">
                {selectedModel?.name || "Select model"}
              </span>
              {selectedModel?.free && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  FREE
                </Badge>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-3xl p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-96">
            {filteredModels.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No models found matching "{searchQuery}"
              </div>
            ) : (
              Object.entries(groupedModels).map(
                ([provider, providerModels]: [string, any]) => (
                  <div key={provider} className="p-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      {providerNames[provider] || provider}
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        {providerModels.length}
                      </Badge>
                    </div>
                    {providerModels.map((model: any) => (
                      <div
                        key={model.id}
                        className={cn(
                          "relative flex cursor-pointer select-none items-start gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                          selectedModelId === model.id && "bg-accent"
                        )}
                        onClick={() => {
                          onModelSelect(model.id);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex h-5 items-center">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedModelId === model.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm leading-none truncate">
                              {model.name}
                            </span>
                            {model.free && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1 text-[10px] bg-green-500/20 text-green-700 dark:text-green-400"
                              >
                                FREE
                              </Badge>
                            )}
                            {model.recommended && (
                              <Zap className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>
                              Context:{" "}
                              {formatContextLength(model.context_length)}
                            </span>
                            {model.supportsTools && (
                              <>
                                <span>•</span>
                                <span>Tools ✓</span>
                              </>
                            )}
                            {model.supportsVision && (
                              <>
                                <span>•</span>
                                <span>Vision ✓</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0 cursor-pointer"
                          onClick={(e) => openModelDetails(model, e)}
                        >
                          <Info className="h-3.5 w-3.5" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {selectedForDetails?.name}
              {selectedForDetails?.free && (
                <Badge variant="secondary" className="bg-green-500/20">
                  FREE
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this AI model
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="pr-4 h-[400px]">
            {selectedForDetails && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedForDetails.description}
                  </p>
                </div>

                <Separator />

                {/* Provider Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Provider</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {providerNames[selectedForDetails.provider] ||
                        selectedForDetails.provider}
                    </Badge>
                    {selectedForDetails.free && (
                      <Badge variant="secondary" className="bg-green-500/20">
                        Free Tier Available
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Context & Capabilities */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Context & Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Context Length
                      </p>
                      <p className="text-sm font-medium">
                        {formatContextLength(selectedForDetails.context_length)}{" "}
                        tokens
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Tool Support
                      </p>
                      <p className="text-sm font-medium">
                        {selectedForDetails.supportsTools ? "✓ Yes" : "✗ No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Vision Support
                      </p>
                      <p className="text-sm font-medium">
                        {selectedForDetails.supportsVision ? "✓ Yes" : "✗ No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Recommended
                      </p>
                      <p className="text-sm font-medium">
                        {selectedForDetails.recommended ? "✓ Yes" : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedForDetails.supportsTools && (
                      <Badge variant="outline">Function Calling</Badge>
                    )}
                    {selectedForDetails.supportsVision && (
                      <Badge variant="outline">Vision/Images</Badge>
                    )}
                    {selectedForDetails.free && (
                      <Badge variant="outline" className="bg-green-500/10">
                        Free Usage
                      </Badge>
                    )}
                    {selectedForDetails.context_length >= 100000 && (
                      <Badge variant="outline">Large Context</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Pricing Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Pricing</h3>
                  {selectedForDetails.free ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Badge variant="secondary" className="bg-green-500/20">
                        FREE
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        This model is free to use within rate limits
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Pay-per-use model (using your API credits)
                      </p>
                    </div>
                  )}
                </div>

                {/* Model ID */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Model ID</h3>
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {selectedForDetails.id}
                  </code>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
